'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { KeyRound, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestOtp, resetPasswordWithOtp } = useInventory();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('admin@stocksense.io');
  const [otp, setOtp] = useState('');
  const [generatedOtpHint, setGeneratedOtpHint] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = requestOtp(identifier);
    if (res.success && res.otp) {
      setGeneratedOtpHint(res.otp);
      setOtp(res.otp); // Pre-fill for instant frictionless demo testing
      setStep(2);
    } else {
      setErrorMsg(res.error || 'Failed to send OTP.');
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = resetPasswordWithOtp(identifier, otp, newPassword);
    if (res.success) {
      setSuccessMsg('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080b14] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-[#0c101d]/90 p-8 sm:p-10 shadow-2xl border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-600/20">
            <KeyRound className="h-7 w-7" />
          </div>
          <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Security & Recovery
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {step === 1 ? 'Reset Password' : 'Enter OTP Verification'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {step === 1
              ? 'Enter your registered Email or Login ID to receive a 6-digit OTP'
              : 'Submit the 6-digit verification code and your new secure password'}
          </p>
        </div>

        {/* Demo OTP Banner */}
        {generatedOtpHint && step === 2 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <span>Simulated SMS/Email OTP Code: </span>
              <strong className="font-mono text-sm tracking-widest text-white font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-emerald-500/30 ml-1">
                {generatedOtpHint}
              </strong>
            </div>
          </div>
        )}

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs font-medium text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs font-medium text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Request OTP Form */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Registered Email or Login ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. admin@stocksense.io or admin123"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.99] transition-all cursor-pointer"
            >
              Generate 6-Digit OTP Code
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          /* Step 2: Reset Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[0.5em] font-mono font-bold text-lg rounded-2xl border border-white/10 bg-slate-900/80 py-3 px-4 text-white focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder=">8 chars, 1 uppercase, 1 lower, 1 special"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-xs font-semibold text-white focus:border-indigo-500 focus:bg-slate-800/90 focus:outline-hidden"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-[0.99] transition-all cursor-pointer"
            >
              Update Password & Sign In
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Change Email / Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
