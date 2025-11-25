"use client";

import Link from "next/link";

export default function ResetSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="bg-white shadow-lg rounded p-8 w-full max-w-md text-center space-y-6">
        
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-4xl text-green-600">✓</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold">Password Reset Successful!</h2>

        <p className="text-gray-600 text-sm">
          Your password has been updated. You can now login using your new password.
        </p>

        <Link
          href="/login"
          className="block w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
