
"use client";

import { useState } from "react";
import loggin from '../../app/register/page';
import Link from "next/link";


export default function LoginForm() {
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

      // Save token in cookies + localStorage
      localStorage.setItem("token", data.token);
      // localStorage.setItem("token", data.user);

      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.log("Login Error:", err);
      setError("Network error. Please try again.");
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
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

<button
  type="submit"
  disabled={loading}
  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
>
  {loading ? "Logging in..." : "Login"}
</button>

{/* ADD THIS */}
<div className="text-center pt-2 text-sm flex justify-between">
  <Link href="/forgot-password" className="text-indigo-600 hover:underline">
    Forgot Password?
  </Link>

  <Link href="/register" className="text-indigo-600 hover:underline">
    Create new account
  </Link>
</div>


      </form>
    </div>
  );
}
