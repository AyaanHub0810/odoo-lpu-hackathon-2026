'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { SignUpButton } from '@clerk/nextjs';
import { Lock, User, Mail, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useInventory();

  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic live validation status checks
  const isLoginIdValid = loginId.trim().length >= 6 && loginId.trim().length <= 12;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordLengthValid = password.length > 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasLower && hasUpper && hasSpecial;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify Re-Enter Password.');
      return;
    }

    setLoading(true);
    const res = signup({
      loginId,
      email,
      password,
      fullName: fullName.trim() || loginId.trim(),
    });
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrorMsg(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080b14] font-sans">
      {/* Left Column: Form matching Excalidraw */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:w-[500px] xl:w-[560px] bg-[#0c101d]/90 border-r border-white/10 relative z-10 shadow-2xl overflow-y-auto backdrop-blur-xl">
        <div className="mx-auto w-full max-w-sm sm:max-w-md space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl shadow-lg ring-2 ring-indigo-500/30">
                <Image
                  src="/stocksense-logo.jpg"
                  alt="StockSense 3D App Logo"
                  width={48}
                  height={48}
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  Stock<span className="text-indigo-400">Sense</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block font-mono">
                  User Registration
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Sign up Page
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Create a user database record to access operations and stock tracking
              </p>
            </div>
          </div>

          {/* Strict Validation Checklist from Excalidraw */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-[11px] text-slate-400 space-y-2 shadow-xl backdrop-blur-xl">
            <span className="font-bold text-white block text-xs">Excalidraw Validation Criteria:</span>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${isLoginIdValid ? 'text-emerald-400' : 'text-slate-600'}`}
              />
              <span className={isLoginIdValid ? 'font-bold text-emerald-300' : 'text-slate-400'}>
                1. Login ID: Unique & between 6-12 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${isEmailValid ? 'text-emerald-400' : 'text-slate-600'}`}
              />
              <span className={isEmailValid ? 'font-bold text-emerald-300' : 'text-slate-400'}>
                2. Email ID: Valid format & strictly unique
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`h-3.5 w-3.5 ${isPasswordValid ? 'text-emerald-400' : 'text-slate-600'}`}
              />
              <span className={isPasswordValid ? 'font-bold text-emerald-300' : 'text-slate-400'}>
                3. Password: &gt;8 chars, 1 uppercase, 1 lowercase, 1 special character
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs font-bold text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Jordan Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 px-4 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Enter Login Id
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="6-12 characters (e.g. jordan12)"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <User className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Enter Email Id
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <Mail className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 9 chars, upper, lower, special"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Re-Enter Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Re-Enter Password identically"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Clerk Authentication Option */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-2xs uppercase">
                <span className="bg-[#0c101d] px-2 font-bold text-slate-500">Or continue with</span>
              </div>
            </div>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 py-2.5 text-xs font-bold text-slate-300 shadow-xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Sign Up with Clerk SSO
              </button>
            </SignUpButton>

            <div className="pt-2 text-center text-xs text-slate-400 font-semibold">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Sign In here
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Visual Showcase */}
      <div className="hidden lg:relative lg:flex lg:flex-1 items-center justify-center overflow-hidden bg-slate-950">
        <Image
          src="/warehouse-banner.jpg"
          alt="Automated Warehouse Showcase"
          fill
          className="object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal hover:opacity-85 transition-all duration-700"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="relative z-10 max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl shadow-2xl text-white space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise Security</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Audit-Grade User Governance
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Every movement, receipt, delivery dispatch, and physical count adjustment is linked directly to
            the responsible logged-in user in the immutable StockSense Ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
