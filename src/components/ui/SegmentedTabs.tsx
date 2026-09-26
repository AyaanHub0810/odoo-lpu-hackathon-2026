'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export default function SegmentedTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: SegmentedTabsProps) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-xs sm:text-sm',
  }[size];

  const buttonSize = {
    sm: 'px-2.5 py-1',
    md: 'px-3.5 py-1.5',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-100/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-inner ${sizeClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 rounded-xl font-bold transition-colors select-none cursor-pointer z-10 ${buttonSize} ${
              isActive
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-tabs-pill"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-[0_2px_12px_rgba(79,70,229,0.35)] -z-10"
              />
            )}
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-mono transition-colors ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
