'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

type Tab = 'password' | 'pin' | 'qr';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithPin } = useAuthStore();
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await loginWithPin(userId, pin);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'PIN login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">VoIP Platform</h1>
          <p className="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-dark-800 rounded-lg p-1">
            {(['password', 'pin', 'qr'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                {t === 'qr' ? 'QR Code' : t === 'pin' ? 'PIN' : 'Password'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="••••••••" />
              </div>
              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-primary-500 hover:text-primary-400">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-50 transition-opacity hover:opacity-90">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {tab === 'pin' && (
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User ID or Email</label>
                <input type="text" value={userId} onChange={e => setUserId(e.target.value)} required
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="your-user-id or email" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">6-Digit PIN</label>
                <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={6} pattern="[0-9]{6}" required
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold disabled:opacity-50 hover:opacity-90">
                {loading ? 'Verifying...' : 'Sign In with PIN'}
              </button>
            </form>
          )}

          {tab === 'qr' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-48 h-48 bg-dark-800 rounded-xl border border-white/10 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-sm">Scan with mobile app</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Open the VoIP mobile app and scan this code to sign in instantly</p>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary-500 hover:text-primary-400 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

