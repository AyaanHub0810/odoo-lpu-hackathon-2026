'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useInventory } from '@/context/InventoryContext';
import {
  Database,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Cloud,
  Layers,
  ArrowUpDown,
  X,
} from 'lucide-react';

export default function DemoDataWidget() {
  const pathname = usePathname();
  const { isMongoConnected, loadDemoData, syncToMongoDB, products, operations } = useInventory();
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-minimize after 12 seconds on initial mount so it doesn't obstruct view
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsMinimized(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // If on landing page or auth routes, do not render floating widget
  if (
    pathname === '/' ||
    pathname === '/landing' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  ) {
    return null;
  }

  const handleLoadDemo = async () => {
    setLoading(true);
    setFeedback(null);
    setHasInteracted(true);
    try {
      const res = await loadDemoData('mongodb');
      setFeedback(res.message);
      setTimeout(() => {
        setFeedback(null);
        setIsMinimized(true); // dock to side once loaded!
      }, 3000);
    } catch {
      setFeedback('Loaded local demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToMongo = async () => {
    setLoading(true);
    setFeedback(null);
    setHasInteracted(true);
    try {
      const res = await syncToMongoDB();
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          /* Minimized Docked Tab on the Right Edge */
          <motion.button
            key="minimized-tab"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => {
              setIsMinimized(false);
              setHasInteracted(true);
            }}
            className="pointer-events-auto flex items-center gap-2 rounded-l-2xl border-y border-l border-indigo-500/30 bg-[#090d16]/95 px-3 py-2.5 shadow-2xl backdrop-blur-xl text-xs font-bold text-white hover:bg-slate-900 transition-all cursor-pointer group"
            title="Expand Demo Data & MongoDB Manager"
          >
            <ChevronLeft className="h-4 w-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline text-[11px] font-mono">Demo Data</span>
            </div>
            {isMongoConnected ? (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="MongoDB Atlas Connected" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-400" title="Offline / Local Storage" />
            )}
          </motion.button>
        ) : (
          /* Expanded Card */
          <motion.div
            key="expanded-card"
            initial={{ x: 100, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="pointer-events-auto mr-4 w-[330px] rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl text-slate-800 dark:text-slate-100 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    Demo Data Hub
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>MongoDB Atlas Connected</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMinimized(true);
                  setHasInteracted(true);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Dock to side"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Live Data Summary */}
            <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02] p-3 text-[11px] space-y-2">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Active Products (SKUs):</span>
                <strong className="text-slate-900 dark:text-white font-mono">{products.length}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Active Operations:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{operations.length}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Storage Target:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  alienx.mongodb.net
                </span>
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedback}</span>
              </motion.div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                disabled={loading}
                onClick={handleLoadDemo}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Seeding MongoDB...' : 'Load Sample Demo Data'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={loading}
                  onClick={handleSyncToMongo}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer"
                >
                  <Cloud className="h-3 w-3 text-cyan-500" />
                  Sync to Cloud
                </button>

                <button
                  onClick={() => {
                    setIsMinimized(true);
                    setHasInteracted(true);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                >
                  Dock
                </button>
              </div>
            </div>

            <p className="text-[9px] text-center text-slate-400 dark:text-slate-500">
              You can dock this tool to the side anytime and reopen it whenever needed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
