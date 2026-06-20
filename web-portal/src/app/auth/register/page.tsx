'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-gray-400 mb-6">Check your email to verify your account, then sign in.</p>
        <Link href="/auth/login" className="block w-full py-3 rounded-lg bg-primary-500 text-white font-semibold text-center hover:bg-primary-600 transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1">Start your VoIP journey today</p>
        </div>

        <div className="glass-card p-8">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {['firstName', 'lastName'].map(f => (
                <div key={f}>
                  <label className="block text-sm text-gray-400 mb-1 capitalize">{f.replace('N', ' N')}</label>
                  <input name={f} value={form[f]} onChange={handleChange} required
                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder={f === 'firstName' ? 'John' : 'Doe'} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Min 8 chars, 1 uppercase, 1 number" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}