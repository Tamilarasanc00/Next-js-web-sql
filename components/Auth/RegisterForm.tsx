'use client';

import { useState } from 'react';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <input
              type="text"
              name="name"
              required
              placeholder="Full Name"
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300"
              value={formData.name}
              onChange={handleChange}
            />

            {/* Mobile Number */}
            <input
              type="text"
              name="mobile"
              required
              placeholder="Mobile Number"
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300"
              value={formData.mobile}
              onChange={handleChange}
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300"
              value={formData.email}
              onChange={handleChange}
            />

            {/* User Type Dropdown */}
            <select
              name="userType"
              required
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300 text-gray-900"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="">Select User Type</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
            </select>

            {/* Password */}
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300"
              value={formData.password}
              onChange={handleChange}
            />

            {/* Confirm Password */}
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm Password"
              className="appearance-none rounded w-full px-3 py-2 border border-gray-300"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
