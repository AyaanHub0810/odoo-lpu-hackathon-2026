'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  History,
  Box,
  Map,
  QrCode,
  Building2,
  MapPin,
  X,
  CornerDownLeft,
  Command,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { products, operations } = useInventory();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown handler for Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Action definitions
  const staticItems = [
    {
      id: 'dash',
      title: 'Dashboard Overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      color: 'text-indigo-500',
      action: () => router.push('/dashboard'),
    },
    {
      id: 'receipts',
      title: 'Inbound Receipts (+IN)',
      category: 'Operations',
      icon: ArrowDownLeft,
      color: 'text-emerald-500',
      badge: 'Vendor Stock',
      action: () => router.push('/operations/receipts'),
    },
    {
      id: 'deliveries',
      title: 'Outbound Deliveries (-OUT)',
      category: 'Operations',
      icon: ArrowUpRight,
      color: 'text-rose-500',
      badge: 'Dispatches',
      action: () => router.push('/operations/deliveries'),
    },
    {
      id: 'transfers',
      title: 'Internal Bin Transfers',
      category: 'Operations',
      icon: ArrowLeftRight,
      color: 'text-cyan-500',
      action: () => router.push('/operations/transfers'),
    },
    {
      id: 'adjustments',
      title: 'Cycle Count Adjustments',
      category: 'Operations',
      icon: SlidersHorizontal,
      color: 'text-amber-500',
      action: () => router.push('/operations/adjustments'),
    },
    {
      id: 'products',
      title: 'Products Master Catalog & SKUs',
      category: 'Inventory',
      icon: Package,
      color: 'text-indigo-500',
      action: () => router.push('/products'),
    },
    {
      id: 'moves',
      title: 'Stock Ledger (Double-Entry Audit)',
      category: 'Inventory',
      icon: History,
      color: 'text-cyan-500',
      action: () => router.push('/move-history'),
    },
    {
      id: 'twin-3d',
      title: '3D Warehouse Digital Twin (Live View)',
      category: 'Warehouse Twin',
      icon: Box,
      color: 'text-purple-500',
      badge: 'LIVE 3D',
      action: () => router.push('/warehouse-3d'),
    },
    {
      id: 'wh-settings',
      title: 'Warehouse Facilities & Buildings',
      category: 'Facilities',
      icon: Building2,
      color: 'text-indigo-500',
      action: () => router.push('/settings/warehouses'),
    },
    {
      id: 'loc-settings',
      title: 'Storage Bins & Rack Locations',
      category: 'Facilities',
      icon: MapPin,
      color: 'text-emerald-500',
      action: () => router.push('/settings/locations'),
    },
  ];

  // Dynamic search items from products and recent operations
  const dynamicItems = [
    ...products.slice(0, 8).map((p) => ({
      id: `prod-${p.id}`,
      title: `${p.name} (${p.sku})`,
      category: 'SKU Catalog',
      icon: Package,
      color: 'text-indigo-400',
      badge: `${p.onHand} ${p.uom}`,
      action: () => router.push('/products'),
    })),
    ...operations.slice(0, 8).map((op) => ({
      id: `op-${op.id}`,
      title: `${op.reference} - ${op.contactName}`,
      category: 'Recent Orders',
      icon: op.operationType === 'RECEIPT' ? ArrowDownLeft : ArrowUpRight,
      color: op.operationType === 'RECEIPT' ? 'text-emerald-500' : 'text-rose-500',
      badge: op.status,
      action: () =>
        router.push(
          op.operationType === 'RECEIPT'
            ? `/operations/receipts/${op.id}`
            : `/operations/deliveries/${op.id}`
        ),
    })),
  ];

  const allItems = [...staticItems, ...dynamicItems];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  const handleSelect = (index: number) => {
    const item = filteredItems[index];
    if (item) {
      item.action();
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md"
          />

          {/* Command Card Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-0 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-10"
          >
            {/* Header search bar */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 px-5 py-4">
              <Search className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, receipts, SKUs, or jump to..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="rounded-xl p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                  No commands or inventory matches found for &quot;{query}&quot;
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(index)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`relative flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 ${item.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {item.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                            {item.badge}
                          </span>
                        )}
                        {isSelected && (
                          <span className="flex items-center text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                            <CornerDownLeft className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with keyboard navigation badges */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 px-5 py-2.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-1 py-0.5 text-[10px]">
                    &uarr;
                  </kbd>
                  <kbd className="rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-1 py-0.5 text-[10px]">
                    &darr;
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-1 py-0.5 text-[10px]">
                    &crarr;
                  </kbd>{' '}
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-1 py-0.5 text-[10px]">
                    ESC
                  </kbd>{' '}
                  Close
                </span>
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                StockSense QuickNav
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
