'use client';

import React from 'react';
import { motion } from 'motion/react';

export type StatusVariant = 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled' | 'optimal' | 'low' | 'empty';

interface StatusBadgeProps {
  status: string | StatusVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  size = 'md',
  pulse = true,
  className = '',
}: StatusBadgeProps) {
  const norm = status.toLowerCase() as StatusVariant;

  const configMap: Record<
    string,
    {
      label: string;
      bg: string;
      text: string;
      border: string;
      dot: string;
      ping: string;
      glow: string;
    }
  > = {
    done: {
      label: 'Done',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30 dark:border-emerald-500/40',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    },
    optimal: {
      label: 'Optimal',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30 dark:border-emerald-500/40',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    },
    ready: {
      label: 'Ready',
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-500/30 dark:border-cyan-500/40',
      dot: 'bg-cyan-500',
      ping: 'bg-cyan-400',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    },
    waiting: {
      label: 'Waiting',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30 dark:border-amber-500/40',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    },
    low: {
      label: 'Low Stock',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30 dark:border-amber-500/40',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    },
    draft: {
      label: 'Draft',
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-400/30 dark:border-white/10',
      dot: 'bg-slate-400',
      ping: 'bg-slate-300',
      glow: 'shadow-sm',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/30 dark:border-rose-500/40',
      dot: 'bg-rose-500',
      ping: 'bg-rose-400',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    },
    empty: {
      label: 'Empty',
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-300 dark:border-white/10',
      dot: 'bg-slate-400',
      ping: 'bg-slate-400',
      glow: '',
    },
  };

  const current = configMap[norm] || {
    label: status,
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-white/10',
    dot: 'bg-slate-400',
    ping: 'bg-slate-300',
    glow: '',
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2';

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full font-mono font-bold uppercase tracking-wider border backdrop-blur-md select-none ${sizeClasses} ${current.bg} ${current.text} ${current.border} ${current.glow} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${current.ping}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${current.dot}`} />
      </span>
      <span>{current.label}</span>
    </motion.span>
  );
}
