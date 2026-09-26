'use client';

import React, { useRef, useState } from 'react';
import { Search, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  category?: string;
  onCategoryChange?: (category: string) => void;
  categories?: { label: string; value: string }[];
  shortcutBadge?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search inventory, SKUs, references...',
  category,
  onCategoryChange,
  categories,
  shortcutBadge = '⌘K',
  className = '',
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
        isFocused
          ? 'border-indigo-500/80 bg-white dark:bg-[#0c101d] ring-4 ring-indigo-500/15 dark:ring-indigo-500/25 shadow-lg shadow-indigo-500/5'
          : 'border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-white/20'
      } ${className}`}
    >
      {/* Category selector if provided */}
      {categories && onCategoryChange && (
        <div className="relative border-r border-slate-200 dark:border-white/10 pr-1 pl-3 py-2">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-2"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Leading Search Icon */}
      <div className="pl-3.5 pr-2 flex items-center pointer-events-none">
        <Search
          className={`h-4 w-4 transition-colors duration-200 ${
            isFocused ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        />
      </div>

      {/* Main text input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent py-2.5 pr-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
      />

      {/* Trailing actions: Clear button and keyboard shortcut */}
      <div className="pr-3 flex items-center gap-1.5">
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              <X className="h-3 w-3" />
            </motion.button>
          )}
        </AnimatePresence>

        {shortcutBadge && !value && (
          <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 select-none">
            {shortcutBadge === '⌘K' ? (
              <>
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </>
            ) : (
              <span>{shortcutBadge}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
