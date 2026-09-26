'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { QrCode, X, Search, CheckCircle2, AlertCircle, ArrowDownLeft, ArrowUpRight, Camera } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function BarcodeScannerModal({ onClose }: { onClose: () => void }) {
  const { products } = useInventory();
  const [scannedCode, setScannedCode] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const handleScanLookup = (code: string) => {
    const clean = code.trim().toUpperCase();
    setScannedCode(clean);
    const found = products.find(
      (p) => p.sku.toUpperCase() === clean || p.id.toUpperCase() === clean || p.name.toUpperCase().includes(clean)
    );
    if (found) {
      setMatchedProduct(found);
      setNotFound(false);
    } else {
      setMatchedProduct(null);
      setNotFound(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">In-App Camera & SKU Scanner</h3>
              <p className="text-xs text-slate-400">Scan barcodes or enter SKU for instant stock lookup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Simulated Scanner Viewfinder with animation */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-500/40 bg-slate-950 p-6 text-center text-white shadow-inner flex flex-col items-center justify-center h-48">
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-pulse" />
            <Camera className="h-10 w-10 text-indigo-400 mb-2 animate-bounce" />
            <span className="text-xs font-semibold text-slate-200">
              Camera Lens Active: Align Barcode / QR Code inside frame
            </span>
            <span className="mt-1 text-[11px] text-slate-500 font-mono">
              Supported: EAN-13, Code 128, QR Code, Data Matrix
            </span>
          </div>

          {/* Quick Simulation Barcode Triggers */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Test Simulation Barcodes:
            </label>
            <div className="flex flex-wrap gap-2">
              {['DESK001', 'TAB001', 'STEEL001', 'CHAIR001'].map((sku) => (
                <button
                  key={sku}
                  onClick={() => handleScanLookup(sku)}
                  className="rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all cursor-pointer"
                >
                  ⚡ Scan {sku}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Or type SKU manually (e.g. DESK001)..."
              value={scannedCode}
              onChange={(e) => handleScanLookup(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-800/80 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 shadow-xl backdrop-blur-xl focus:border-indigo-500 focus:outline-hidden"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Scan Result Card */}
          {matchedProduct && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Item Found</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{matchedProduct.name}</h4>
                  <p className="text-xs font-mono font-semibold text-indigo-400">{matchedProduct.sku}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Unit Price</div>
                  <div className="text-base font-black font-mono text-white">{formatCurrency(matchedProduct.perUnitCost)}</div>
                </div>
              </div>

              {/* Stock counters */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                <div className="rounded-xl bg-slate-900/80 p-2.5 border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Total On Hand:</span>
                  <span className="text-base font-black font-mono text-white">
                    {matchedProduct.onHand} <span className="text-xs font-sans text-slate-400">{matchedProduct.uom}</span>
                  </span>
                </div>
                <div className="rounded-xl bg-slate-900/80 p-2.5 border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Free to Use:</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    {matchedProduct.freeToUse} <span className="text-xs font-sans text-slate-400">{matchedProduct.uom}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/operations/receipts/new?product=${matchedProduct.id}`}
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  Receive Inbound
                </Link>
                <Link
                  href={`/operations/deliveries/new?product=${matchedProduct.id}`}
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-colors"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Dispatch Outbound
                </Link>
              </div>
            </div>
          )}

          {notFound && scannedCode && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>No product found matching SKU &ldquo;{scannedCode}&rdquo;. Please verify barcode.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
