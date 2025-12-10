'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth} from '@/src/context/AuthContext';
import { toast } from 'react-hot-toast';

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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold">Login</h1>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input" />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input" />
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
    </form>
  );
}