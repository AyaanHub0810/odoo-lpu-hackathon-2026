'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import {
  Plus,
  List,
  Kanban,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';
import SegmentedTabs from '@/components/ui/SegmentedTabs';
import StatusBadge from '@/components/ui/StatusBadge';
import ShimmerButton from '@/components/ui/ShimmerButton';

export default function DeliveriesListPage() {
  const { operations } = useInventory();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'Waiting' | 'Ready' | 'Done'>('all');

  // Filter only delivery orders
  const deliveries = operations.filter((op) => op.operationType === 'DELIVERY');

  // Search by reference & contacts
  const filteredDeliveries = deliveries.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.reference.toLowerCase().includes(q) ||
      d.contactName.toLowerCase().includes(q) ||
      d.sourceLocationCode.toLowerCase().includes(q)
    );
  });

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: deliveries.length },
    { id: 'Draft', label: 'Draft', count: deliveries.filter((d) => d.status === 'Draft').length },
    { id: 'Waiting', label: 'Waiting', count: deliveries.filter((d) => d.status === 'Waiting').length },
    { id: 'Ready', label: 'Ready', count: deliveries.filter((d) => d.status === 'Ready').length },
    { id: 'Done', label: 'Done', count: deliveries.filter((d) => d.status === 'Done').length },
  ];

  const kanbanColumns: Array<'Draft' | 'Waiting' | 'Ready' | 'Done'> = [
    'Draft',
    'Waiting',
    'Ready',
    'Done',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Outbound Logistics &middot; Customer Fulfillment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <ArrowUpRight className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            Delivery Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick, pack, and validate customer shipments with real-time stock reservation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/80 p-1 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              Kanban
            </button>
          </div>

          {/* Elevated NEW ShimmerButton */}
          <Link href="/operations/deliveries/new">
            <ShimmerButton variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
              NEW DELIVERY
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {/* 21st.dev Style Flexi Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sliding Pill Status Tabs */}
        <SegmentedTabs
          tabs={filterTabs}
          activeTab={statusFilter}
          onChange={(tabId) => setStatusFilter(tabId as any)}
          size="md"
        />

        {/* Compound Search Bar */}
        <div className="w-full md:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search reference, customer, bin..."
            shortcutBadge="⌘K"
          />
        </div>
      </div>

      {/* View 1: List View (Default) */}
      {viewMode === 'list' ? (
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">From Location</th>
                  <th className="px-6 py-3.5">Destination</th>
                  <th className="px-6 py-3.5">Customer Contact</th>
                  <th className="px-6 py-3.5">Scheduled Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                {filteredDeliveries.map((d) => {
                  const isLate = d.scheduledDate < new Date().toISOString().split('T')[0] && d.status !== 'Done';
                  const hasOutOfStock = d.items.some((i) => i.isOutOfStock);

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <Link
                          href={`/operations/deliveries/${d.id}`}
                          className="hover:underline inline-flex items-center gap-1.5"
                        >
                          <span>{d.reference}</span>
                          {hasOutOfStock && (
                            <span className="rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 text-[9px] font-bold">
                              Shortage
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">
                        {d.sourceLocationCode}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {d.destinationLocationCode}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {d.contactName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span
                            className={
                              isLate
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-slate-500 dark:text-slate-400'
                            }
                          >
                            {d.scheduledDate}
                          </span>
                          {isLate && (
                            <span className="rounded bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-1.5 py-0.2 text-[9px] font-black text-rose-700 dark:text-rose-300 uppercase">
                              Late
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={d.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/operations/deliveries/${d.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all"
                        >
                          Inspect
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filteredDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400 font-mono">
                      No delivery orders match current criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View 2: Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((colStatus) => {
            const colItems = filteredDeliveries.filter((d) => d.status === colStatus);

            return (
              <div
                key={colStatus}
                className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 space-y-3 backdrop-blur-xl shadow-sm dark:shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={colStatus} size="sm" />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colItems.map((d) => (
                    <Link
                      key={d.id}
                      href={`/operations/deliveries/${d.id}`}
                      className={`block rounded-2xl border p-4 shadow-sm transition-all hover:scale-[1.02] group ${
                        d.status === 'Waiting'
                          ? 'border-amber-200 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <span>{d.reference}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal text-[10px]">
                          {d.scheduledDate}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                        {d.contactName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        From: {d.sourceLocationCode}
                      </div>
                      {d.status === 'Waiting' && (
                        <div className="mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Waiting for stock
                        </div>
                      )}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
                        <span className="font-mono">
                          {d.items.reduce((acc, i) => acc + i.quantityDemanded, 0)} units
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] group-hover:translate-x-1 transition-transform">
                          Inspect &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                  {colItems.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                      No orders in {colStatus}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
