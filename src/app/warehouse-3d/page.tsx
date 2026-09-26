'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Radio,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Package,
  Building2,
  MapPin,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import ThreeWarehouseViewer from '@/components/ThreeWarehouseViewer';
import ShimmerButton from '@/components/ui/ShimmerButton';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Warehouse3DPage() {
  const { products, operations, warehouses, locations, createOperation, transitionOperationStatus } = useInventory();
  const [activeTab, setActiveTab] = useState<'all' | 'inbound' | 'racks'>('all');

  // Filter completed and pending receipts
  const receipts = operations.filter((op) => op.operationType === 'RECEIPT');
  const doneReceipts = receipts.filter((r) => r.status === 'Done');
  const pendingReceipts = receipts.filter((r) => r.status !== 'Done');

  const totalPallets = products.reduce((acc, p) => acc + Math.ceil(p.onHand / 20), 0);

  // Quick Action to receive sample shipment
  const handleQuickReceive = () => {
    if (products.length === 0) return;
    const targetProduct = products[Math.floor(Math.random() * products.length)];
    const wh = warehouses[0];
    const vendorLoc = locations.find((l) => l.type === 'vendor') || locations[0];
    const destLoc = locations.find((l) => l.type === 'internal') || locations[1] || locations[0];

    if (!wh || !vendorLoc || !destLoc) return;

    const newOp = createOperation({
      operationType: 'RECEIPT',
      warehouseId: wh.id,
      sourceLocationId: vendorLoc.id,
      destinationLocationId: destLoc.id,
      contactName: 'FastTrack Air Freight Logistics',
      scheduledDate: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: targetProduct.id,
          quantity: 20,
        },
      ],
      notes: 'Live Inbound Shipment into 3D Facility',
    });

    transitionOperationStatus(newOp.id, 'Done');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Digital Twin &middot; WH-CENTRAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 mt-0.5">
            <Box className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            3D Warehouse Digital Twin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time physical spatial representation &middot; Live rack occupancy, AGV autonomous fleet, and inbound pallet allocation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operations/receipts"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            Receipts Pipeline
          </Link>

          <ShimmerButton
            onClick={handleQuickReceive}
            variant="success"
            size="md"
            icon={<Zap className="h-4 w-4" />}
          >
            Receive Inbound Pallet
          </ShimmerButton>
        </div>
      </div>

      {/* Top Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Rack Storage Units</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalPallets}</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">24 Active Bays</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Dual-aisle heavy duty pallet racks</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Inbound Receipts</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{doneReceipts.length}</span>
            <span className="text-xs font-mono text-slate-500">Completed</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{pendingReceipts.length} shipments pending in queue</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Autonomous AGV Bot</span>
            <Radio className="h-4 w-4 text-cyan-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">AGV-01</span>
            <span className="text-xs font-mono text-cyan-500 font-bold">Online</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">LiDAR guidance aisle patrolling</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Occupancy Efficiency</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">88.4%</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Optimal</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">11.6% staging buffer available</p>
        </div>
      </div>

      {/* Main 3D Canvas Showcase */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-950 p-2 shadow-2xl overflow-hidden">
        <ThreeWarehouseViewer fullHeight={true} />
      </div>

      {/* Bottom Inbound Queue & Storage Bin Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Inbound Feed */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                Live Inbound Receipts Stream
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shipments processed into warehouse 3D storage slots
              </p>
            </div>
            <Link
              href="/operations/receipts/new"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Create Receipt
            </Link>
          </div>

          <div className="space-y-2.5">
            {doneReceipts.slice(-4).reverse().map((receipt) => {
              const item = receipt.items[0];
              return (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-white/5 p-3.5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {receipt.reference}
                        </span>
                        <StatusBadge status="done" size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item ? item.name : 'Bulk Items'} &middot; {receipt.contactName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{item?.quantityDone || 20} units
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">Assigned Rack A1</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Physical Facility Telemetry */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl space-y-4">
          <div className="border-b border-slate-100 dark:border-white/10 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-500" />
              Zone Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Facility structure breakdown</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Rack Row A (West)</div>
                  <div className="text-[10px] text-slate-400">Fast-moving electronics</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">12 Bays</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Rack Row B (East)</div>
                  <div className="text-[10px] text-slate-400">Accessories & cables</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">12 Bays</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-200">Dock Staging Bay</div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Inbound inspection pad</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
