'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import {
  SlidersHorizontal,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History,
} from 'lucide-react';

export default function AdjustmentsPage() {
  const { products, stockMoves, quickAdjustStock } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedLocation, setSelectedLocation] = useState('WH/Stock1');
  const [countedQty, setCountedQty] = useState(0);
  const [reason, setReason] = useState('Physical bin count verification / Damaged scrap');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const recordedLocationStock = selectedProduct?.locationStocks[selectedLocation] || 0;
  const diff = countedQty - recordedLocationStock;

  // Filter adjustment moves from stockMoves
  const adjustmentHistory = stockMoves.filter((m) => m.operationType === 'ADJUSTMENT');

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    quickAdjustStock(selectedProduct.id, selectedLocation, Number(countedQty), reason);
    setFeedback(
      `Adjustment applied successfully! ${selectedProduct.name} at ${selectedLocation} updated from ${recordedLocationStock} to ${countedQty} ${selectedProduct.uom} (Difference: ${diff >= 0 ? '+' : ''}${diff}).`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-white/10 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Reconciliation Engine</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Stock Adjustments</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fix discrepancies between recorded software stock and physical bin counts (shrinkage, damage, cycle count)
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Reconciliation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adjustment Action Form */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
            <SlidersHorizontal className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Execute Adjustment</h2>
          </div>

          <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((prod) => prod.id === e.target.value);
                  setCountedQty(p?.locationStocks[selectedLocation] || 0);
                }}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Bin Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCountedQty(selectedProduct?.locationStocks[e.target.value] || 0);
                }}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-800 dark:text-white focus:border-amber-500 focus:outline-hidden"
              >
                <option value="WH/Stock1">WH/Stock1 (Stock Area 1)</option>
                <option value="WH/Stock2">WH/Stock2 (Stock Area 2)</option>
                <option value="WH/Production">WH/Production (Production Floor)</option>
              </select>
            </div>

            {/* Current Recorded Stock Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Recorded Software Stock
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {recordedLocationStock} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">{selectedProduct?.uom}</span>
              </div>
            </div>

            {/* Physical Counted Input */}
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Counted Physical Quantity
              </label>
              <input
                type="number"
                required
                min={0}
                value={countedQty}
                onChange={(e) => setCountedQty(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-base font-bold font-mono text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Discrepancy Calculation Box */}
            <div
              className={`rounded-2xl border p-4 flex items-center justify-between text-xs font-bold ${
                diff === 0
                  ? 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                  : diff < 0
                  ? 'border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300'
                  : 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300'
              }`}
            >
              <span>Difference / Adjustment:</span>
              <span className="text-base font-black font-mono flex items-center gap-1.5">
                {diff < 0 ? <TrendingDown className="h-4 w-4 text-rose-400" /> : diff > 0 ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : null}
                {diff >= 0 ? `+${diff}` : diff} {selectedProduct?.uom}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Audit Reason</label>
              <input
                type="text"
                required
                placeholder="e.g. Damaged in transit, 3 kg scrap..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 py-3.5 font-bold text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Apply Adjustment & Write Ledger
            </button>
          </form>
        </div>

        {/* Adjustment Audit Log */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reconciliation & Physical Count Audit Log</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{adjustmentHistory.length} adjustments</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5 text-right">Adjustment Qty</th>
                  <th className="px-6 py-3.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                {adjustmentHistory.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{adj.reference}</td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">{adj.moveDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{adj.productName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">[{adj.sku}]</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600 dark:text-slate-300">{adj.toLocation}</td>
                    <td className="px-6 py-3.5 text-right font-black font-mono text-amber-600 dark:text-amber-400">
                      {adj.quantity} {adj.uom}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 italic">{adj.notes || 'Physical Count Adjustment'}</td>
                  </tr>
                ))}
                {adjustmentHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs">
                      No inventory count adjustments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
