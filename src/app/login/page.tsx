'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { SignInButton, useUser } from '@clerk/nextjs';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useInventory();
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();

  const [loginId, setLoginId] = useState('admin123');
  const [password, setPassword] = useState('Admin@123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clerkLoaded && (isSignedIn || user)) {
      router.replace('/dashboard');
    }
  }, [clerkLoaded, isSignedIn, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = login(loginId, password);
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid Login Id or Password');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080b14] font-sans">
      {/* Left Column: Interactive Form matching Excalidraw */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:w-[480px] xl:w-[540px] bg-[#0c101d]/90 border-r border-white/10 relative z-10 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto w-full max-w-sm sm:max-w-md space-y-6">
          {/* App Logo & Header matching Excalidraw */}
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
                  Next-Gen WMS
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Login Page
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your system credentials to access the real-time inventory dashboard
              </p>
            </div>
          </div>

          {/* Demo Credentials Quick Fill Banner */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/30 p-4 text-xs text-indigo-300 flex items-start gap-3 shadow-xl backdrop-blur-xl">
            <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-white">Demo Credentials (Ready to use):</span>
              <div className="font-mono text-indigo-300 flex flex-wrap gap-2 text-[11px]">
                <span className="bg-slate-900/90 px-2 py-0.5 rounded-lg border border-indigo-500/30 text-slate-200">
                  Login ID: <strong className="text-white">admin123</strong>
                </span>
                <span className="bg-slate-900/90 px-2 py-0.5 rounded-lg border border-indigo-500/30 text-slate-200">
                  Password: <strong className="text-white">Admin@123</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Error Message matching Excalidraw */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-bold text-rose-300 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form matching Excalidraw inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Login Id
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter Login Id"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* SIGN IN Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Clerk Authentication Option */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-2xs uppercase">
                <span className="bg-[#0c101d] px-2 font-bold text-slate-500">Or continue with</span>
              </div>
            </div>

            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 py-3 text-xs font-bold text-slate-300 shadow-xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Sign In with Clerk SSO
              </button>
            </SignInButton>

            {/* Links matching Excalidraw */}
            <div className="pt-2 text-center text-xs font-semibold text-slate-400">
              <Link
                href="/forgot-password"
                className="text-slate-400 hover:text-indigo-400 hover:underline transition-colors"
              >
                Forget Password ?
              </Link>
              <span className="mx-3 text-slate-600">|</span>
              <Link
                href="/signup"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </form>

          {/* Excalidraw Logic Specification Note */}
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-3.5 text-[11px] text-slate-400 space-y-0.5">
            <span className="font-bold text-slate-300 block">Excalidraw Specification Rules:</span>
            <p>&bull; Check for Login Credentials against database</p>
            <p>&bull; Match creds and allow to login a user</p>
            <p>&bull; If creds do not match, throw: &ldquo;Invalid Login Id or Password&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Right Column: High-Tech 3D Warehouse Showcase with generated art */}
      <div className="hidden lg:relative lg:flex lg:flex-1 items-center justify-center overflow-hidden bg-slate-950">
        <Image
          src="/warehouse-banner.jpg"
          alt="Smart Automated Warehouse Visual"
          fill
          className="object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal hover:opacity-85 transition-all duration-700"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Holographic Glassmorphic Card */}
        <div className="relative z-10 max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl shadow-2xl text-white space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-Time Double-Entry IMS</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Zero-Error Warehouse Execution
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminate inventory discrepancies with automated auto-increment reference sequences,
            in-app camera barcode scanning, 2D floor maps, and instant stock ledger synchronization.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
              <span className="text-indigo-400 font-bold block text-lg">100%</span>
              <span className="text-[10px] text-slate-400">Audit Trail</span>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
              <span className="text-emerald-400 font-bold block text-lg">Live</span>
              <span className="text-[10px] text-slate-400">Stock Balance</span>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
              <span className="text-purple-400 font-bold block text-lg">0 RF</span>
              <span className="text-[10px] text-slate-400">Web Scanner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
