'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { operations, products } = useInventory();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate live notifications based on actual data
  const recentReceipts = operations
    .filter((op) => op.operationType === 'RECEIPT' && op.status === 'Done')
    .slice(0, 3)
    .map((op) => ({
      id: `rec-${op.id}`,
      type: 'receipt',
      title: `Shipment Received (${op.reference})`,
      desc: `${op.items.reduce((s, i) => s + i.quantityDone, 0)} units received from ${op.contactName}`,
      time: 'Live',
      link: `/operations/receipts/${op.id}`,
      icon: ArrowDownLeft,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    }));

  const lowStockProducts = products
    .filter((p) => p.freeToUse <= p.minReorderThreshold)
    .slice(0, 2)
    .map((p) => ({
      id: `low-${p.id}`,
      type: 'alert',
      title: `Low Stock: ${p.name}`,
      desc: `Only ${p.freeToUse} ${p.uom} remaining (Min threshold: ${p.minReorderThreshold})`,
      time: 'Attention',
      link: '/products',
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    }));

  const allNotifications = [...recentReceipts, ...lowStockProducts];
  const unreadCount = allNotifications.length;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#090d16]">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
            <span className="relative">{unreadCount}</span>
          </span>
        )}
      </motion.button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Warehouse Signals</span>
                <span className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300">
                  {unreadCount} active
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Notification items */}
            <div className="py-2 space-y-1.5 max-h-[300px] overflow-y-auto">
              {allNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No active operational alerts
                </div>
              ) : (
                allNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-slate-100/70 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl border flex-shrink-0 mt-0.5 ${n.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex-shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {n.desc}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors mt-2" />
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-2 px-2 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Telemetry Active
              </span>
              <Link
                href="/move-history"
                onClick={() => setIsOpen(false)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                View Move Ledger &rarr;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
