export default function ResetSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white shadow-lg rounded-md p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-green-600">Password Updated!</h1>
        <p className="text-gray-600 mt-2">
          Your password has been reset successfully.
        </p>

        <a
          href="/login"
          className="mt-6 inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
