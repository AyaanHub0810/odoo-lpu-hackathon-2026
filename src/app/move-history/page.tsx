'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Search, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function MoveHistoryPage() {
  const { stockMoves } = useInventory();
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT' | 'INTERNAL' | 'ADJUSTMENT'>('ALL');

  // Multi-row explosion matching Excalidraw specification
  const filteredMoves = stockMoves.filter((m) => {
    if (directionFilter !== 'ALL' && m.moveDirection !== directionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = m.reference.toLowerCase().includes(q);
      const matchContact = m.contactName.toLowerCase().includes(q);
      const matchProd = m.productName.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q);
      const matchLoc = m.fromLocation.toLowerCase().includes(q) || m.toLocation.toLowerCase().includes(q);
      return matchRef || matchContact || matchProd || matchLoc;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header matching Excalidraw */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Stock Ledger & Audit Trail</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Move History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable double-entry stock ledger. IN moves displayed in emerald, OUT moves displayed in rose.
          </p>
        </div>

        {/* Legend pills matching Excalidraw rules */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 text-emerald-300 font-bold backdrop-blur-xl">
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
            <span>IN Moves (+Recv)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-950/30 px-3.5 py-1.5 text-rose-300 font-bold backdrop-blur-xl">
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
            <span>OUT Moves (-Ship)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar matching Excalidraw */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search moves by reference (WH/IN/0001, WH/OUT/0002) or contact (Azure Interior)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 shadow-xl backdrop-blur-xl focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-hidden"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="sm:w-56">
          <select
            value={directionFilter}
            onChange={(e: any) => setDirectionFilter(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-xl focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Movements</option>
            <option value="IN" className="bg-slate-900 text-white">IN Moves (Green)</option>
            <option value="OUT" className="bg-slate-900 text-white">OUT Moves (Red)</option>
            <option value="INTERNAL" className="bg-slate-900 text-white">INTERNAL Moves</option>
            <option value="ADJUSTMENT" className="bg-slate-900 text-white">ADJUSTMENTS</option>
          </select>
        </div>
      </div>

      {/* Move History Table matching Excalidraw Columns */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-800/60 font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">From</th>
                <th className="px-6 py-3.5">To</th>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5 text-right">Quantity</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredMoves.map((m) => {
                const isIN = m.moveDirection === 'IN';
                const isOUT = m.moveDirection === 'OUT';

                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isIN
                        ? 'bg-emerald-950/15 hover:bg-emerald-950/30'
                        : isOUT
                        ? 'bg-rose-950/15 hover:bg-rose-950/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Reference */}
                    <td className="px-6 py-3.5 font-mono font-bold">
                      <span
                        className={
                          isIN
                            ? 'text-emerald-400'
                            : isOUT
                            ? 'text-rose-400'
                            : 'text-indigo-400'
                        }
                      >
                        {m.reference}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-3.5 font-mono text-slate-400">{m.moveDate}</td>

                    {/* Contact */}
                    <td className="px-6 py-3.5 font-semibold text-white">{m.contactName}</td>

                    {/* From Location */}
                    <td className="px-6 py-3.5 font-mono text-slate-400">{m.fromLocation}</td>

                    {/* To Location */}
                    <td className="px-6 py-3.5 font-mono text-slate-200 font-semibold">{m.toLocation}</td>

                    {/* Product */}
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-white block">{m.productName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">[{m.sku}]</span>
                    </td>

                    {/* Quantity (Green for IN, Red for OUT per Excalidraw) */}
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`text-sm font-black font-mono ${
                          isIN
                            ? 'text-emerald-400'
                            : isOUT
                            ? 'text-rose-400'
                            : 'text-slate-200'
                        }`}
                      >
                        {isIN ? `+${m.quantity}` : isOUT ? `-${m.quantity}` : m.quantity} <span className="text-xs font-sans text-slate-400">{m.uom}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          m.status === 'Done'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredMoves.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-xs">
                    No movements recorded matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
