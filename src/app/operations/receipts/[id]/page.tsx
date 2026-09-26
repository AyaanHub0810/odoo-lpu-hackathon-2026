'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import {
  Printer,
  XCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Box,
} from 'lucide-react';
import PrintSlipModal from '@/components/PrintSlipModal';
import ShimmerButton from '@/components/ui/ShimmerButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/utils';

export default function ReceiptDetailPage() {
  const params = useParams();
  const { operations, products, transitionOperationStatus, updateOperation } = useInventory();

  const id = params?.id as string;
  const operation = operations.find((op) => op.id === id);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string; show3DLink?: boolean } | null>(null);

  // New product line form state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [newLineQty, setNewLineQty] = useState(1);

  if (!operation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Receipt Not Found</h2>
        <Link
          href="/operations/receipts"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Receipts List
        </Link>
      </div>
    );
  }

  const handleAction = (nextStatus: 'Ready' | 'Done' | 'Cancelled') => {
    setFeedbackMsg(null);
    const res = transitionOperationStatus(operation.id, nextStatus);
    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: res.message || `Receipt moved to ${nextStatus}`,
        show3DLink: nextStatus === 'Done',
      });
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.message || 'Operation failed',
      });
    }
  };

  const handleAddProductLine = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const newItem = {
      id: `item-${Date.now()}`,
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      uom: prod.uom,
      quantityDemanded: Number(newLineQty),
      quantityDone: Number(newLineQty),
      unitPrice: prod.perUnitCost,
    };

    updateOperation(operation.id, {
      items: [...operation.items, newItem],
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (operation.status === 'Done') return;
    updateOperation(operation.id, {
      items: operation.items.filter((i) => i.id !== itemId),
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/operations/receipts"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Receipts List
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Quick 3D Twin Link */}
          <Link
            href="/warehouse-3d"
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-sm hover:border-purple-300 transition-all"
          >
            <Box className="h-3.5 w-3.5 text-purple-500" />
            <span>3D Pallet View</span>
          </Link>

          <Link
            href="/operations/receipts/new"
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            + New Receipt
          </Link>
        </div>
      </div>

      {/* Main Document Box */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Action Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/60 px-6 py-4 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* When in Draft: "To Do" moves to Ready */}
            {operation.status === 'Draft' && (
              <ShimmerButton
                onClick={() => handleAction('Ready')}
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                To Do (Mark Ready)
              </ShimmerButton>
            )}

            {/* When in Ready: "Validate" moves to Done and updates 3D view */}
            {operation.status === 'Ready' && (
              <ShimmerButton
                onClick={() => handleAction('Done')}
                variant="success"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                Validate &amp; Receive into 3D Rack
              </ShimmerButton>
            )}

            {/* When in Done: "Print" button becomes active */}
            {operation.status === 'Done' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-950 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt Slip
                </button>

                <Link
                  href="/warehouse-3d"
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                >
                  <Box className="h-4 w-4 text-emerald-500" />
                  View Pallet in 3D
                </Link>
              </div>
            )}

            {/* Cancel Button */}
            {operation.status !== 'Done' && operation.status !== 'Cancelled' && (
              <button
                onClick={() => handleAction('Cancelled')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          {/* Pipeline State Ribbon */}
          <div className="flex items-center gap-2">
            <StatusBadge status={operation.status} size="md" />
          </div>
        </div>

        {/* Feedback Alert with 3D link */}
        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 flex items-center justify-between gap-2 rounded-2xl p-3.5 text-xs font-medium animate-in fade-in ${
              feedbackMsg.type === 'success'
                ? 'border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>

            {feedbackMsg.show3DLink && (
              <Link
                href="/warehouse-3d"
                className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <Box className="h-3.5 w-3.5" />
                Inspect in 3D Warehouse Twin &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Inbound Shipment Document
              </span>
              <h2 className="text-3xl font-mono font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {operation.reference}
              </h2>
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Warehouse Facility:{' '}
              <strong className="text-slate-800 dark:text-white font-mono">{operation.warehouseCode}</strong>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Receive From (Vendor / Supplier)
              </label>
              <input
                type="text"
                disabled={operation.status === 'Done'}
                value={operation.contactName}
                onChange={(e) => updateOperation(operation.id, { contactName: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Destination Storage Rack / Bay
              </label>
              <input
                type="text"
                disabled={operation.status === 'Done'}
                value={operation.destinationLocationCode}
                onChange={(e) => updateOperation(operation.id, { destinationLocationCode: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                disabled={operation.status === 'Done'}
                value={operation.scheduledDate}
                onChange={(e) => updateOperation(operation.id, { scheduledDate: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Responsible Operator
              </label>
              <input
                type="text"
                disabled={operation.status === 'Done'}
                value={operation.responsible}
                onChange={(e) => updateOperation(operation.id, { responsible: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden disabled:opacity-60"
              />
            </div>
          </div>

          {/* Products Line Items */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900 dark:text-white">Products Line Items</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {operation.items.length} line{operation.items.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-white/10 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-center">Unit Price</th>
                    <th className="px-6 py-3 text-right">Quantity</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                    {operation.status !== 'Done' && <th className="px-6 py-3 text-right">Remove</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {operation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          [{item.sku}]
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600 dark:text-slate-300 font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-black text-slate-900 dark:text-white text-sm">
                        {item.quantityDemanded} {item.uom}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {formatCurrency(item.unitPrice * item.quantityDemanded)}
                      </td>
                      {operation.status !== 'Done' && (
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Line Form */}
            {operation.status !== 'Done' && (
              <form
                onSubmit={handleAddProductLine}
                className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 p-4 text-xs"
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-indigo-600 focus:outline-hidden"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                        [{p.sku}] {p.name} (₹{p.perUnitCost})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={newLineQty}
                    onChange={(e) => setNewLineQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Line Item
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      {showPrintModal && <PrintSlipModal operation={operation} onClose={() => setShowPrintModal(false)} />}
    </div>
  );
}
