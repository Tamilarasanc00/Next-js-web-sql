"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyOtpClient() {
  const search = useSearchParams();
  const router = useRouter();

  const email = search.get("email") || "";
  const serverOtp = search.get("otp") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Safe redirect inside useEffect
  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  // Prevent flashing wrong UI
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting…
      </div>
    );
  }

  const handleVerify = async (e: any) => {
    e.preventDefault();
    setError("");

    if (otp !== serverOtp) {
      setError("Invalid OTP");
      return;
    }

    router.push(`/reset-password?email=${email}`);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        setLoading(false);
        return;
      }

      setResendMessage("OTP resent successfully!");
    } catch (err) {
      setError("Network error, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white shadow-lg rounded p-6 w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Verify OTP</h2>

        <p className="text-center text-gray-600 text-sm">
          Enter 4-digit OTP sent to <b>{email}</b>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 text-center rounded">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="bg-green-100 text-green-700 p-3 text-center rounded">
            {resendMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-3 border rounded text-center text-xl tracking-widest"
          maxLength={4}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
        >
          Verify OTP
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
        >
          {loading ? "Resending..." : "Resend OTP"}
        </button>

        <div className="text-center text-sm pt-2">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
