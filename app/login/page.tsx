// import LoginForm from "@/components/Auth/LoginForm";

// export default function LoginPage() {
//   return <LoginForm />;
// }


"use client";
import { useState } from "react";
import Link from "next/link";

// export default function LoginPage() {
export default function LoginForm({ onToggleMode, onLoginSuccess }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }




      // Save token
      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;



      window.location.href = "/dashboard";



    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded p-6 w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded 
                     hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between text-sm pt-2">
          <Link href="/forgot-password" className="text-indigo-600 hover:underline">
            Forgot Password?
          </Link>

          <Link href="/register" className="text-indigo-600 hover:underline">
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}
