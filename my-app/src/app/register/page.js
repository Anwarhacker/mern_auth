'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/axios';

function AlertIcon({ type }) {
  const color = type === 'error' ? 'text-red-400' : 'text-emerald-400';
  return (
    <svg className={`w-4 h-4 ${color} flex-shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {type === 'error'
        ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
        : <><polyline points="20 6 9 17 4 12" /></>}
    </svg>
  );
}
function EyeIcon({ show, toggle }) {
  return (
    <button type="button" onClick={toggle} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
      {show ? (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}
function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

export default function RegisterPage() {
  const [form, setForm]   = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const validate = () => {
    if (!form.name.trim())    return 'Full name is required.';
    if (!form.email.trim())   return 'Email is required.';
    if (!form.password)       return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. If on Vercel, check you redeployed after setting NEXT_PUBLIC_API_URL.');
      } else {
        setError(err.response.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] auth-gradient relative overflow-hidden flex-col items-center justify-center p-14">
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-violet-600 glow-orb" />
        <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-indigo-600 glow-orb" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-8 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Join AuthApp</h1>
          <p className="text-indigo-200 text-base mb-10 leading-relaxed">Create a free account and get access to your personal dashboard in seconds.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <p className="text-indigo-300 font-semibold mb-3 text-sm uppercase tracking-wider">What you get</p>
            {['Secure JWT authentication','Personal CRUD dashboard','Email-based password reset','Data visible only to you'].map((f) => (
              <div key={f} className="flex items-center gap-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <span className="text-2xl font-bold text-slate-100">AuthApp</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-100 mb-1.5">Create account</h2>
            <p className="text-slate-400">Fill in the details below to get started</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 fade-in">
              <AlertIcon type="error" /><p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 fade-in">
              <AlertIcon type="success" /><p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" autoComplete="name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone <span className="text-slate-500 font-normal text-xs">(optional)</span></label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" autoComplete="tel" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address <span className="text-red-400">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" autoComplete="new-password" className="input-field pr-12" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><EyeIcon show={showPass} toggle={() => setShowPass(!showPass)} /></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" className="input-field pr-12" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><EyeIcon show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} /></div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <><Spinner />Creating account...</> : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
