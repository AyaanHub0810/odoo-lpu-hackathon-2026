'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface ShimmerButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  shimmer?: boolean;
}

export default function ShimmerButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  shimmer = true,
  ...props
}: ShimmerButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2 rounded-2xl',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 rounded-2xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.4)] border border-indigo-400/30 hover:border-indigo-300/60',
    success:
      'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] dark:shadow-[0_4px_20px_rgba(16,185,129,0.4)] border border-emerald-400/30 hover:border-emerald-300/60',
    danger:
      'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)] dark:shadow-[0_4px_20px_rgba(244,63,94,0.4)] border border-rose-400/30 hover:border-rose-300/60',
    secondary:
      'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 shadow-sm',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 border border-slate-300 dark:border-white/15',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent',
  }[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative inline-flex items-center justify-center font-semibold overflow-hidden transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {shimmer && (variant === 'primary' || variant === 'success' || variant === 'danger') && (
        <span
          className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          style={{
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      )}
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </motion.button>
  );
}
