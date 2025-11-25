// "use client";

// import { useState } from "react";

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/auth/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Something went wrong");
//       } else {
//         setOtp(data.otp); // Display OTP to user (static flow)
//         localStorage.setItem("resetEmail", email);
//       }
//     } catch {
//       setError("Network error");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white shadow-lg p-6 rounded-md max-w-sm w-full space-y-4"
//       >
//         <h1 className="text-2xl font-bold text-center">Forgot Password</h1>

//         {error && <p className="text-red-600 text-sm">{error}</p>}
//         {otp && (
//           <p className="text-green-600 text-sm">
//             Your OTP is: <b>{otp}</b>
//           </p>
//         )}

//         <input
//           type="email"
//           placeholder="Enter email"
//           className="w-full p-2 border rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <button
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white p-2 rounded"
//         >
//           {loading ? "Sending OTP..." : "Send OTP"}
//         </button>

//         {otp && (
//           <a
//             href="/verify-otp"
//             className="block text-center text-indigo-600 underline text-sm"
//           >
//             Enter OTP
//           </a>
//         )}
//       </form>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email not found");
        setLoading(false);
        return;
      }

      // OTP returned from server (for demo)
      setServerOtp(data.otp);
      setOtpSent(true);
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <form
        onSubmit={handleSendOtp}
        className="bg-white shadow-lg rounded p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded text-center">
            {error}
          </div>
        )}

        {!otpSent ? (
          <>
            <p className="text-gray-600 text-center text-sm">
              Enter your email to receive 4-digit OTP
            </p>

            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="text-center text-sm pt-2">
              <Link href="/login" className="text-indigo-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="bg-green-100 p-3 text-center text-green-700 rounded">
              OTP Sent Successfully!
            </div>

            <p className="text-center text-gray-600 text-sm">
              Your OTP (demo mode):  
              <span className="font-semibold text-indigo-600">{serverOtp}</span>
            </p>

            <Link
              href={{
                pathname: "/verify-otp",
                query: { email, otp: serverOtp },
              }}
              className="block w-full bg-indigo-600 text-white text-center py-3 rounded hover:bg-indigo-700"
            >
              Continue
            </Link>
          </>
        )}
      </form>
    </div>
  );
}
