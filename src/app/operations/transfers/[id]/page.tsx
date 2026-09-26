'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertCircle,
  Printer,
} from 'lucide-react';
import PrintSlipModal from '@/components/PrintSlipModal';

export default function TransferDetailPage() {
  const params = useParams();
  const { operations, transitionOperationStatus } = useInventory();

  const id = params?.id as string;
  const operation = operations.find((op) => op.id === id);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!operation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Transfer Not Found</h2>
        <Link
          href="/operations/transfers"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transfers List
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
        text: res.message || `Transfer moved to ${nextStatus}`,
      });
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.message || 'Operation failed',
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Link
        href="/operations/transfers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Transfers List
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Action Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {operation.status === 'Draft' && (
              <button
                onClick={() => handleAction('Ready')}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Ready
              </button>
            )}

            {operation.status === 'Ready' && (
              <button
                onClick={() => handleAction('Done')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Validate Transfer (Move Stock)
              </button>
            )}

            {operation.status === 'Done' && (
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Transfer Note
              </button>
            )}

            {operation.status !== 'Done' && operation.status !== 'Cancelled' && (
              <button
                onClick={() => handleAction('Cancelled')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200 shadow-2xs text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-lg ${
                operation.status === 'Draft' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Draft
            </span>
            <span className="text-slate-300 px-1">&gt;</span>
            <span
              className={`px-3 py-1 rounded-lg ${
                operation.status === 'Ready'
                  ? 'bg-blue-600 text-white'
                  : operation.status === 'Done'
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              Ready
            </span>
            <span className="text-slate-300 px-1">&gt;</span>
            <span
              className={`px-3 py-1 rounded-lg ${
                operation.status === 'Done' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Done
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-medium animate-in fade-in ${
              feedbackMsg.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operation / Transfer</span>
              <h2 className="text-3xl font-mono font-black text-slate-900 tracking-tight mt-0.5">
                {operation.reference}
              </h2>
            </div>
            <div className="text-sm font-semibold text-slate-500">
              Warehouse: <strong className="text-slate-800">{operation.warehouseCode}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Source Location (From)
              </span>
              <span className="font-mono text-base font-bold text-slate-900 block mt-1">
                {operation.sourceLocationCode}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Destination Location (To)
              </span>
              <span className="font-mono text-base font-bold text-slate-900 block mt-1">
                {operation.destinationLocationCode}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scheduled Transfer Date
              </label>
              <input
                type="text"
                disabled
                value={operation.scheduledDate}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Responsible Operator
              </label>
              <input
                type="text"
                disabled
                value={operation.responsible}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <span className="text-base font-bold text-slate-900 block">Transferred Line Items</span>
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-right">Transfer Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {operation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">[{item.sku}]</span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-black text-slate-900 text-sm">
                        {item.quantityDemanded} {item.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showPrintModal && <PrintSlipModal operation={operation} onClose={() => setShowPrintModal(false)} />}
    </div>
  );
}
