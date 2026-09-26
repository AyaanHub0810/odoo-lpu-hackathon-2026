'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Map,
  X,
  Building2,
  Package,
  Layers,
  ArrowDownLeft,
  Truck,
  Gauge,
  Activity,
  Warehouse,
  ChevronRight,
  Zap,
  Box,
} from 'lucide-react';

export default function WarehouseVisualMapModal({ onClose }: { onClose: () => void }) {
  const { locations, products } = useInventory();
  const [selectedLoc, setSelectedLoc] = useState<any>(locations[0] || null);
  const [selectedZone, setSelectedZone] = useState<string>('A');

  const getProductsAtLocation = (locCode: string) => {
    return products.filter((p) => (p.locationStocks[locCode] || 0) > 0);
  };

  const getHeatColor = (fill: number) => {
    if (fill >= 85) return { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/40', text: 'text-rose-400', bar: 'bg-gradient-to-r from-rose-500 to-rose-400', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-500' };
    if (fill >= 60) return { bg: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-gradient-to-r from-amber-500 to-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-500' };
    return { bg: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/25', text: 'text-emerald-400', bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' };
  };

  const zones = [
    {
      id: 'A',
      name: 'Zone A — Light Storage',
      subtitle: 'Aisles 1-3 · Small Parts & Electronics',
      icon: Box,
      gradient: 'from-indigo-500 to-blue-500',
      filter: (l: any) => l.type === 'internal' && l.shortCode === 'WH/Stock1',
      defaultFill: 80,
    },
    {
      id: 'B',
      name: 'Zone B — Heavy Storage',
      subtitle: 'Aisles 4-6 · Pallet Racking',
      icon: Warehouse,
      gradient: 'from-violet-500 to-purple-500',
      filter: (l: any) => l.type === 'internal' && l.shortCode === 'WH/Stock2',
      defaultFill: 50,
    },
    {
      id: 'C',
      name: 'Zone C — Fabrication',
      subtitle: 'Workstations · Assembly Lines',
      icon: Zap,
      gradient: 'from-cyan-500 to-teal-500',
      filter: (l: any) => l.type === 'internal' && l.shortCode === 'WH/Production',
      defaultFill: 40,
    },
  ];

  const activeZone = zones.find((z) => z.id === selectedZone)!;
  const zoneLocations = locations.filter(activeZone.filter);

  // Calculate aggregate stats
  const totalLocations = locations.filter((l) => l.type === 'internal').length;
  const avgFill = totalLocations > 0
    ? Math.round(locations.filter((l) => l.type === 'internal').reduce((acc, l) => acc + (l.currentFill || 50), 0) / Math.max(totalLocations, 1))
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0a0e1a] border border-slate-200/80 dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] px-6 py-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25">
                <Map className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white dark:ring-[#0a0e1a]" />
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Warehouse Floor Plan
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Live rack occupancy · Interactive bin telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats chips */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] px-3 py-1.5 border border-slate-200/60 dark:border-white/[0.06]">
                  <Activity className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 font-mono">{avgFill}% Avg</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] px-3 py-1.5 border border-slate-200/60 dark:border-white/[0.06]">
                  <Gauge className="h-3 w-3 text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 font-mono">{totalLocations} Bins</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────── */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            {/* Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3.5 border border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-indigo-500" />
                <span>Facility: Main Central Warehouse</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span className="text-slate-500 dark:text-slate-400">&lt;60% Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  <span className="text-slate-500 dark:text-slate-400">60-85% High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
                  <span className="text-slate-500 dark:text-slate-400">&gt;85% Critical</span>
                </div>
              </div>
            </div>

            {/* Zone Selector Tabs */}
            <div className="flex gap-2">
              {zones.map((zone) => {
                const isActive = selectedZone === zone.id;
                const ZoneIcon = zone.icon;
                return (
                  <motion.button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex-1 flex items-center gap-2.5 rounded-2xl p-3.5 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-white/[0.06] border-slate-200 dark:border-white/[0.1] shadow-lg shadow-slate-200/50 dark:shadow-black/30'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-100 dark:hover:border-white/[0.06]'
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? `bg-gradient-to-br ${zone.gradient} text-white shadow-md` : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400'} transition-all`}>
                      <ZoneIcon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'} transition-colors`}>
                        {zone.name}
                      </p>
                      <p className={`text-[10px] ${isActive ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'} transition-colors`}>
                        {zone.subtitle}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="zone-indicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Floor Plan Grid */}
            <div className="rounded-3xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.015] p-5 relative overflow-hidden">
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-30 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Interactive Bin Layout — {activeZone.name}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedZone}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    {zoneLocations.length > 0 ? (
                      zoneLocations.map((loc, idx) => {
                        const fill = loc.currentFill || activeZone.defaultFill;
                        const isSelected = selectedLoc?.id === loc.id;
                        const heat = getHeatColor(fill);
                        const storedCount = getProductsAtLocation(loc.shortCode).length;

                        return (
                          <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.25 }}
                            onClick={() => setSelectedLoc(loc)}
                            className={`relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 overflow-hidden group ${
                              isSelected
                                ? `${heat.border} ring-1 ring-indigo-500/20 bg-white dark:bg-white/[0.04] shadow-lg`
                                : 'border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/[0.1] hover:shadow-md'
                            }`}
                          >
                            {/* Gradient accent top bar */}
                            <div className={`absolute top-0 left-0 right-0 h-0.5 ${heat.bar} opacity-80`} />

                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{loc.name}</p>
                                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{loc.shortCode}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${heat.badge}`}>
                                {fill}%
                              </span>
                            </div>

                            {/* Capacity bar */}
                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden mb-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fill}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className={`h-full rounded-full ${heat.bar} shadow-sm`}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 dark:text-slate-500">
                                Capacity: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{loc.capacity || 200}</span>
                              </span>
                              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                                <Package className="h-3 w-3" />
                                <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{storedCount}</span> items
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center mx-auto rounded-2xl bg-slate-100 dark:bg-white/[0.06] mb-3">
                          <Warehouse className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No bins configured</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">This zone has no storage locations assigned yet</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dock indicators */}
              <div className="relative z-10 mt-5 pt-4 border-t border-dashed border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] px-4 py-2.5 border border-emerald-200 dark:border-emerald-500/20">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Inbound Receiving · Dock 1-3
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/[0.08] px-4 py-2.5 border border-rose-200 dark:border-rose-500/20">
                  <Truck className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    Outbound Staging · Bay 4-6
                  </span>
                </div>
              </div>
            </div>

            {/* ── Selected Location Detail Panel ───────────────── */}
            <AnimatePresence mode="wait">
              {selectedLoc && (
                <motion.div
                  key={selectedLoc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedLoc.name}</h4>
                        <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">{selectedLoc.shortCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Capacity</span>
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{selectedLoc.capacity || 200} <span className="text-[10px] font-sans text-slate-400">units</span></span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                      Stored Items
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getProductsAtLocation(selectedLoc.shortCode).length > 0 ? (
                        getProductsAtLocation(selectedLoc.shortCode).map((p, i) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/[0.03] p-3 border border-slate-100 dark:border-white/[0.06] group hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.03] transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <Package className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-white block">{p.name}</span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{p.sku}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                {p.locationStocks[selectedLoc.shortCode]}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{p.uom}</span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-2 py-8 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.06]">
                          <Package className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            No items at this location
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
