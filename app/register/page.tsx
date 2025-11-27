
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("customer");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 🔥 FORM DATA (not JSON)
      const form = new FormData();
      form.append("name", name);
      form.append("mobile", mobile);
      form.append("email", email);
      form.append("password", password);
      form.append("userType", userType);

      if (imageFile) {
        form.append("image", imageFile);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Network error. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Create Account</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 text-center rounded">
            {error}
          </div>
        )}

        {/* Image Upload */}
        <div className="space-y-2 text-center">
          <label className="text-gray-700 text-sm font-medium">Profile Image</label>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full p-3 border rounded"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 rounded-full border object-cover mx-auto"
            />
          )}
        </div>

        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

<input
  type="text"
  className="w-full p-3 border rounded"
  placeholder="Mobile Number"
  value={mobile}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
  }}
  pattern="[0-9]{10}"
  title="Please enter exactly 10 digits"
  required
/>


        <input
          type="email"
          className="w-full p-3 border rounded"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="customer">Customer</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="password"
          className="w-full p-3 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full p-3 border rounded"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="text-center text-sm pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
