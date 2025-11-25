// "use client";

// import { useState } from "react";

// export default function ResetPasswordPage() {
//   const [newPassword, setNewPassword] = useState("");
//   const [message, setMessage] = useState("");

//   const email = typeof window !== "undefined" ? localStorage.getItem("resetEmail") : "";

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();

//     const res = await fetch("/api/auth/reset-password", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, newPassword }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setMessage("Error resetting password");
//       return;
//     }

//     // setMessage("Password reset successfully! Redirecting...");
//     // localStorage.removeItem("resetEmail");

//     // setTimeout(() => (window.location.href = "/login"), 1500);

// setMessage("Password reset successfully! Redirecting...");
// localStorage.removeItem("resetEmail");

// setTimeout(() => (window.location.href = "/reset-password/success"), 1500);




//   };

//   if (!email) return <p className="text-center mt-10">No email found. Please start over.</p>;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white shadow-lg p-6 rounded-md max-w-sm w-full space-y-4"
//       >
//         <h1 className="text-2xl font-bold text-center">Reset Password</h1>

//         {message && <p className="text-green-600 text-sm">{message}</p>}

//         <input
//           type="password"
//           placeholder="Enter new password"
//           className="w-full p-2 border rounded"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//         />

//         <button className="w-full bg-indigo-600 text-white p-2 rounded">
//           Update Password
//         </button>
//       </form>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const search = useSearchParams();
  const router = useRouter();

  const email = search.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    if (typeof window !== "undefined") router.push("/forgot-password");
  }

  const handleReset = async (e: any) => {
    e.preventDefault();
    setError("");
// console.log("password",password);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ email, password }),
        body: JSON.stringify({ email, password })

      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset failed");
        setLoading(false);
        return;
      }

      router.push("/reset-success");
    } catch (err) {
        console.log("Error",err);
        
      setError("Network error, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white shadow-lg rounded p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>

        <p className="text-gray-600 text-sm text-center">
          Set a new password for <b>{email}</b>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 text-center rounded">
            {error}
          </div>
        )}

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
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
