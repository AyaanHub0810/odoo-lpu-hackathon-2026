'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/50" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative group flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-95 ${
        isDark
          ? 'border-indigo-500/30 bg-indigo-950/40 text-amber-300 hover:border-amber-400/50 hover:bg-indigo-900/50 hover:text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
          : 'border-slate-200/90 bg-white/90 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/80 hover:text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      }`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle Color Theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
