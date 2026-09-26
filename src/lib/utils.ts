import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with a fixed locale (en-IN) to ensure identical rendering
 * on both server (SSR) and client, preventing hydration mismatches.
 */
export function formatNumber(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format currency with a fixed locale and symbol to avoid hydration mismatch.
 */
export function formatCurrency(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return `₹${val}`;
  return `₹${new Intl.NumberFormat('en-IN').format(num)}`;
}

/**
 * Deterministic date formatting (DD/MM/YYYY) that does not depend on system locale.
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
