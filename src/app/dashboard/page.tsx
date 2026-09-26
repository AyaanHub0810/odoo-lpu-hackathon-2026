'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInventory } from '@/context/InventoryContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  ArrowRight,
  Search,
  Sparkles,
  Info,
  Box,
  Layers,
} from 'lucide-react';
import { ThreeWarehouseViewer } from '@/components/ThreeWarehouseViewer';
import { WarehouseHealthScores } from '@/components/analytics/WarehouseHealthScores';
import { StatisticsCard7 } from '@/components/analytics/StatisticsCard7';
import { EfferdAreaChart } from '@/components/analytics/EfferdAreaChart';

export default function DashboardPage() {
  const { operations, products, warehouses, getDashboardStats, user } = useInventory();
  const stats = getDashboardStats();

  // Dynamic Filters matching problem statement & Excalidraw
  const [docTypeFilter, setDocTypeFilter] = useState<'ALL' | 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'3d' | 'charts'>('3d');

  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filtered operations list
  const filteredOperations = operations.filter((op) => {
    if (docTypeFilter !== 'ALL' && op.operationType !== docTypeFilter) return false;
    if (statusFilter !== 'ALL' && op.status !== statusFilter) return false;
    if (warehouseFilter !== 'ALL' && op.warehouseId !== warehouseFilter) return false;
    if (categoryFilter !== 'ALL') {
      const hasCat = op.items.some((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return prod?.category === categoryFilter;
      });
      if (!hasCat) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = op.reference.toLowerCase().includes(q);
      const matchContact = op.contactName.toLowerCase().includes(q);
      const matchItems = op.items.some((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));
      if (!matchRef && !matchContact && !matchItems) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Welcome Banner with Generated 3D Smart Box Illustration */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/95 via-indigo-950/80 to-slate-900/95 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 sm:opacity-35 pointer-events-none overflow-hidden">
          <Image
            src="/smart-box.jpg"
            alt="Smart Inventory Box"
            fill
            className="object-cover object-center mix-blend-screen"
            priority
          />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome back, {user?.fullName || 'Inventory Manager'} &middot; Telemetry Online</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Real-Time Warehouse Command Center
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Monitor live inbound receiving docks, dispatch customer deliveries on schedule, execute internal rack
            transfers, and reconcile physical inventory with zero discrepancies.
          </p>

          {/* Quick Creation Shortcuts */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <Link
              href="/operations/receipts/new"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-500/10 hover:bg-emerald-500/30 hover:shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Receipt (Inbound)
            </Link>
            <Link
              href="/operations/deliveries/new"
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-300 shadow-lg shadow-rose-500/10 hover:bg-rose-500/30 hover:shadow-rose-500/20 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Delivery (Outbound)
            </Link>
            <Link
              href="/operations/transfers/new"
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-300 shadow-lg shadow-cyan-500/10 hover:bg-cyan-500/30 hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Internal Transfer
            </Link>
            <Link
              href="/operations/adjustments"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/10 hover:bg-amber-500/30 hover:shadow-amber-500/20 active:scale-95 transition-all"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Stock Adjust
            </Link>
          </div>
        </div>
      </div>

      {/* 21st.dev Component: Statistics Card 7 (Micro-sparklines & Dynamic KPI pills) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Telemetry Stream
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Powered by 21st.dev</span>
        </div>
        <StatisticsCard7
          onCardClick={(id) => {
            if (id === 'inbound-rate') setDocTypeFilter('RECEIPT');
            if (id === 'outbound-rate') setDocTypeFilter('DELIVERY');
          }}
        />
      </div>

      {/* Interactive 3D Digital Twin & Dual-Flow Analysis Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Box className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Warehouse Spatial & Volumetric Twin
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between full Three.js 3D WebGL Digital Twin and Efferd Dual-Flow Area Curve.
            </p>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 p-1 text-xs font-bold text-slate-600 dark:text-slate-400 self-start sm:self-auto shadow-sm dark:shadow-lg backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('3d')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === '3d'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Three.js 3D Twin</span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Efferd Area Flow</span>
            </button>
          </div>
        </div>

        {activeTab === '3d' ? (
          <ThreeWarehouseViewer />
        ) : (
          <EfferdAreaChart />
        )}
      </div>

      {/* 21st.dev Component: Warehouse Operational Health Scores (Half-Circle Progress Gauges) */}
      <WarehouseHealthScores />

      {/* Excalidraw Wireframe Exact Counter Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Document Workload Counters
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Exact Specification Match</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Receipts Card */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:-translate-y-1 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Inbound Workload</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Receipts Flow</span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stats.pendingReceiptsCount}{' '}
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">to receive</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <button
                onClick={() => {
                  setDocTypeFilter('RECEIPT');
                  setStatusFilter('ALL');
                }}
                title="Late: schedule date < today's date"
                className="font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-2.5 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                {stats.receiptsLateCount} Late
              </button>
              <button
                onClick={() => {
                  setDocTypeFilter('RECEIPT');
                }}
                title="Operations: schedule date >= today's date"
                className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
              >
                {stats.receiptsOperationsCount} operations
              </button>
            </div>
          </div>

          {/* Card 2: Deliveries Card */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl hover:border-rose-400 dark:hover:border-rose-500/40 hover:-translate-y-1 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Outbound Workload</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Deliveries Flow</span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stats.pendingDeliveriesCount}{' '}
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">to deliver</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <button
                onClick={() => setDocTypeFilter('DELIVERY')}
                title="Late: schedule date < today's date"
                className="font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-2 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                {stats.deliveriesLateCount} Late
              </button>
              <button
                onClick={() => {
                  setDocTypeFilter('DELIVERY');
                  setStatusFilter('Waiting');
                }}
                title="Waiting: Waiting for the stocks"
                className="font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-2 py-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/25 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                {stats.deliveriesWaitingCount} waiting
              </button>
              <button
                onClick={() => setDocTypeFilter('DELIVERY')}
                title="Operations: schedule date >= today's date"
                className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
              >
                {stats.deliveriesOperationsCount} operations
              </button>
            </div>
          </div>

          {/* Card 3: Products in Stock */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:-translate-y-1 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Inventory Catalog</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Catalog SKUs</span>
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stats.totalProductsCount}{' '}
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">Products</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Units:</span>
              <strong className="text-slate-900 dark:text-white text-sm font-bold font-mono">{stats.totalInventoryUnits} Units</strong>
            </div>
          </div>

          {/* Card 4: Health & Scheduled Transfers */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl hover:border-amber-400 dark:hover:border-amber-500/40 hover:-translate-y-1 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Stock Health</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Low Stock Alert</span>
              <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight mt-0.5">
                {stats.lowStockItemsCount}{' '}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">critical</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Internal Transfers:</span>
              <span className="font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 px-2 py-0.5 rounded-md">
                {stats.internalTransfersCount} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Excalidraw Status Definitions Note Box */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/20 p-4 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white">Status Rules from System Spec:</span>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px]">
          <span>
            <strong className="text-rose-600 dark:text-rose-400">Late:</strong> schedule date &lt; today&apos;s date
          </span>
          <span>
            <strong className="text-slate-700 dark:text-slate-300">Operations:</strong> schedule date &ge; today&apos;s date
          </span>
          <span>
            <strong className="text-amber-600 dark:text-amber-400">Waiting:</strong> Waiting for the stocks
          </span>
        </div>
      </div>

      {/* Dynamic Multi-Dimensional Filter Bar */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-5 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Dynamic Multi-Dimensional Operations Filter</span>
          </div>
          {(docTypeFilter !== 'ALL' || statusFilter !== 'ALL' || warehouseFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setDocTypeFilter('ALL');
                setStatusFilter('ALL');
                setWarehouseFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Document Type</label>
            <select
              value={docTypeFilter}
              onChange={(e: any) => setDocTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Documents</option>
              <option value="RECEIPT">Receipts (Incoming)</option>
              <option value="DELIVERY">Deliveries (Outgoing)</option>
              <option value="INTERNAL">Internal Transfers</option>
              <option value="ADJUSTMENT">Stock Adjustments</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting (Stock Shortage)</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done (Validated)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Warehouse Facility</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.shortCode} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Product Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Search Reference / Contact</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. WH/IN/0001, Azure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-9 pr-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Current Operations Queue</span>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 font-mono">
              {filteredOperations.length}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click any row to open full lifecycle editor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">From</th>
                <th className="px-6 py-3.5">To</th>
                <th className="px-6 py-3.5">Contact / Partner</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Scheduled</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
              {filteredOperations.map((op) => {
                const isLate = op.scheduledDate < new Date().toISOString().split('T')[0] && op.status !== 'Done';
                const path =
                  op.operationType === 'RECEIPT'
                    ? `/operations/receipts/${op.id}`
                    : op.operationType === 'DELIVERY'
                    ? `/operations/deliveries/${op.id}`
                    : `/operations/transfers/${op.id}`;

                return (
                  <tr key={op.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={path} className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                        {op.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          op.operationType === 'RECEIPT'
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : op.operationType === 'DELIVERY'
                            ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                            : 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30'
                        }`}
                      >
                        {op.operationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{op.sourceLocationCode}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700 dark:text-slate-200">{op.destinationLocationCode}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{op.contactName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {op.items.map((it) => `${it.name} (${it.quantityDemanded})`).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={isLate ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                          {op.scheduledDate}
                        </span>
                        {isLate && (
                          <span className="rounded bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-1.5 py-0.5 text-[9px] font-black text-rose-700 dark:text-rose-300 uppercase">
                            Late
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          op.status === 'Done'
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : op.status === 'Ready'
                            ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30'
                            : op.status === 'Waiting'
                            ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 ring-1 ring-amber-400/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {op.status === 'Waiting' && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                        {op.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={path}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Inspect
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredOperations.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No operations match the selected criteria.
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
