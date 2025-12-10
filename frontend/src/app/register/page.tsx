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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold">Register</h1>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input" />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="input" />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input" />
      <input name="confirm" type="password" placeholder="Confirm Password" value={form.confirm} onChange={handleChange} required className="input" />
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Registering...' : 'Register'}</button>
    </form>
  );
}