'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Logged in!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa]">
      {/* Login Card */}
      <div className="clean-card w-full max-w-[420px] animate-fade-in">
        {/* Inner Container with consistent padding */}
        <div style={{ padding: '48px' }}>
          {/* Header - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#0a0a0a] mb-2">
              Sign in
            </h1>
            <p className="text-[#737373] text-[15px]">
              Enter your credentials to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[13px] font-medium text-[#262626]">
                  Password
                </label>
                <a href="#" className="link text-[12px] text-[#525252] hover:text-[#0a0a0a]">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="input"
                autoComplete="current-password"
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
                    Signing in...
                  </span>
                ) : (
                  'Continue'
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

          {/* Sign Up Link */}
          <p className="text-center text-[#525252] text-[14px]">
            Don't have an account?{' '}
            <Link href="/register" className="link font-medium text-[#0a0a0a]">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}