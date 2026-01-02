'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/src/lib/api';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      toast.success('Registered! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa]">
      {/* Register Card */}
      <div className="clean-card w-full max-w-[420px] animate-fade-in">
        {/* Inner Container with consistent padding */}
        <div style={{ padding: '48px' }}>
          {/* Header - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#0a0a0a] mb-2">
              Create account
            </h1>
            <p className="text-[#737373] text-[15px]">
              Enter your details to get started
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[13px] font-medium text-[#262626]">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
                autoComplete="name"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[13px] font-medium text-[#262626]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[13px] font-medium text-[#262626]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="input"
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirm" className="block text-[13px] font-medium text-[#262626]">
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                required
                className="input"
                autoComplete="new-password"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]"></div>
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="bg-white px-4 text-[#a3a3a3]">or</span>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-[#525252] text-[14px]">
            Already have an account?{' '}
            <a href="/login" className="link font-medium text-[#0a0a0a]">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}