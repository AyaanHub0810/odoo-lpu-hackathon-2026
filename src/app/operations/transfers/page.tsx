'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import {
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react';

export default function TransfersListPage() {
  const { operations } = useInventory();
  const [search, setSearch] = useState('');

  const transfers = operations.filter((op) => op.operationType === 'INTERNAL');

  const filteredTransfers = transfers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.reference.toLowerCase().includes(q) ||
      t.sourceLocationCode.toLowerCase().includes(q) ||
      t.destinationLocationCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Inter-Facility Movements</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Internal Transfers</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Move stock between warehouse racks and production floors without changing total inventory
          </p>
        </div>

        <Link
          href="/operations/transfers/new"
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Transfer
        </Link>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by transfer reference or location code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 shadow-xl backdrop-blur-xl focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-hidden"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-800/60 font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Source Rack (From)</th>
                <th className="px-6 py-3.5">Destination Rack (To)</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Scheduled Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-indigo-400">
                    <Link href={`/operations/transfers/${t.id}`} className="hover:text-indigo-300">
                      {t.reference}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-300">{t.sourceLocationCode}</td>
                  <td className="px-6 py-3.5 font-mono font-semibold text-slate-300">{t.destinationLocationCode}</td>
                  <td className="px-6 py-3.5 text-slate-300">
                    {t.items.map((i) => `${i.name} (${i.quantityDemanded})`).join(', ')}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">{t.scheduledDate}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        t.status === 'Done'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : t.status === 'Ready'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 border border-white/5'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/operations/transfers/${t.id}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-200 shadow-sm hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Open
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredTransfers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-xs">
                    No internal transfers recorded.
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
