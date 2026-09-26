'use client';

import React from 'react';
import { Operation } from '@/types/inventory';
import { Printer, X, Boxes, QrCode } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function PrintSlipModal({
  operation,
  onClose,
}: {
  operation: Operation;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  const isReceipt = operation.operationType === 'RECEIPT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Action Bar (Hidden during print) */}
        <div className="print:hidden flex items-center justify-between border-b border-white/10 bg-slate-800/40 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Printer className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              {isReceipt ? 'Goods Receipt Slip' : 'Delivery Dispatch Slip'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Print Document
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-slip" className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
          {/* Company & Document Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Boxes className="h-6 w-6 text-indigo-600" />
                <span>Stock<span className="text-indigo-600">Sense</span> WMS</span>
              </div>
              <p className="text-xs text-slate-500">Plot 42, Industrial Logistic Park, Sector 18</p>
              <p className="text-xs text-slate-500">Tel: +91 (0) 800-STOCK-WMS | support@stocksense.io</p>
            </div>

            <div className="text-right">
              <div className="inline-block rounded-md bg-slate-900 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                {isReceipt ? 'OFFICIAL GOODS RECEIPT' : 'OUTBOUND DELIVERY NOTE'}
              </div>
              <h2 className="text-xl font-mono font-extrabold text-slate-900 mt-2">{operation.reference}</h2>
              <p className="text-xs text-slate-500">
                Date: {operation.validatedAt ? formatDate(operation.validatedAt) : operation.scheduledDate}
              </p>
            </div>
          </div>

          {/* Reference Meta Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">
                {isReceipt ? 'Received From (Vendor):' : 'Delivery Address (Customer):'}
              </span>
              <strong className="text-sm text-slate-900 block mt-0.5">{operation.contactName}</strong>
              {operation.deliveryAddress && (
                <p className="text-slate-600 mt-1">{operation.deliveryAddress}</p>
              )}
            </div>
            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-400">Warehouse Facility: </span>
                <strong className="text-slate-800">{operation.warehouseCode}</strong>
              </div>
              <div>
                <span className="text-slate-400">Target Location: </span>
                <strong className="text-slate-800 font-mono">
                  {isReceipt ? operation.destinationLocationCode : operation.sourceLocationCode}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Audited By: </span>
                <strong className="text-slate-800">{operation.responsible}</strong>
              </div>
              <div>
                <span className="text-slate-400">Status: </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  {operation.status}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3 text-center">UoM</th>
                  <th className="px-4 py-3 text-right">Qty Received / Dispatched</th>
                  <th className="px-4 py-3 text-right">Unit Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operation.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{item.sku}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{item.uom}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{item.quantityDone}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barcode & Verification QR Section */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-slate-300 bg-white p-2">
                <QrCode className="h-12 w-12 text-slate-800" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-mono font-bold text-slate-900 block">VERIFIED WMS DOCUMENT</span>
                <span className="text-slate-400 block">Scan QR code for real-time digital stock verification</span>
                <span className="text-[10px] text-slate-400 font-mono">SYS-HASH: {operation.id.toUpperCase()}</span>
              </div>
            </div>

            <div className="text-right border-t-2 border-slate-400 pt-2 w-48 text-center">
              <span className="text-xs text-slate-500 block">Authorized Signature</span>
              <span className="text-xs font-semibold text-slate-800 block mt-4">{operation.responsible}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
