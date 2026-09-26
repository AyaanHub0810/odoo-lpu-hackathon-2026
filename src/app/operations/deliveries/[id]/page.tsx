'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import { formatCurrency } from '@/lib/utils';
import {
  Printer,
  XCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Split,
} from 'lucide-react';
import PrintSlipModal from '@/components/PrintSlipModal';

export default function DeliveryDetailPage() {
  const params = useParams();
  const { operations, products, transitionOperationStatus, updateOperation, createOperation } = useInventory();

  const id = params?.id as string;
  const operation = operations.find((op) => op.id === id);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New product line form state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [newLineQty, setNewLineQty] = useState(1);

  if (!operation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Delivery Order Not Found</h2>
        <Link
          href="/operations/deliveries"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deliveries List
        </Link>
      </div>
    );
  }

  // Check out of stock status for all items
  const checkStockAvailability = () => {
    return operation.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const free = prod ? prod.freeToUse : 0;
      const isOOS = item.quantityDemanded > free;
      return {
        ...item,
        isOutOfStock: isOOS,
        freeToUse: free,
      };
    });
  };

  const itemsWithStock = checkStockAvailability();
  const hasOutOfStockItems = itemsWithStock.some((i) => i.isOutOfStock);

  const handleAction = (nextStatus: 'Ready' | 'Done' | 'Cancelled') => {
    setFeedbackMsg(null);
    const res = transitionOperationStatus(operation.id, nextStatus);
    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: res.message || `Delivery order moved to ${nextStatus}`,
      });
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.message || 'Validation failed due to out-of-stock items.',
      });
    }
  };

  // Differentiator 4: 1-Click Split & Backorder
  const handleSplitBackorder = () => {
    // Deliver whatever is in stock now, split remainder into a Backorder
    const deliverNowItems: any[] = [];
    const backorderItems: any[] = [];

    itemsWithStock.forEach((it) => {
      if (it.isOutOfStock) {
        if (it.freeToUse > 0) {
          deliverNowItems.push({ productId: it.productId, quantity: it.freeToUse });
          backorderItems.push({ productId: it.productId, quantity: it.quantityDemanded - it.freeToUse });
        } else {
          backorderItems.push({ productId: it.productId, quantity: it.quantityDemanded });
        }
      } else {
        deliverNowItems.push({ productId: it.productId, quantity: it.quantityDemanded });
      }
    });

    if (deliverNowItems.length > 0) {
      // 1. Update current delivery with available items and set to Ready
      const updatedOpItems = deliverNowItems.map((di) => {
        const prod = products.find((p) => p.id === di.productId);
        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: di.productId,
          sku: prod?.sku || 'SKU',
          name: prod?.name || 'Product',
          uom: prod?.uom || 'Units',
          quantityDemanded: di.quantity,
          quantityDone: di.quantity,
          unitPrice: prod?.perUnitCost || 0,
          isOutOfStock: false,
        };
      });

      updateOperation(operation.id, {
        items: updatedOpItems,
        status: 'Ready',
      });

      // 2. Create the Backorder operation for remaining items
      if (backorderItems.length > 0) {
        const bo = createOperation({
          operationType: 'DELIVERY',
          warehouseId: operation.warehouseId,
          sourceLocationId: operation.sourceLocationId,
          destinationLocationId: operation.destinationLocationId,
          contactName: `${operation.contactName} (Backorder)`,
          deliveryAddress: operation.deliveryAddress,
          scheduledDate: operation.scheduledDate,
          items: backorderItems,
          notes: `Automatic Backorder split from ${operation.reference}`,
        });

        setFeedbackMsg({
          type: 'success',
          text: `Split completed! In-stock items set to Ready. Backorder ${bo.reference} created for remaining items.`,
        });
        return;
      }
    }

    setFeedbackMsg({
      type: 'error',
      text: 'Cannot split: Zero units currently free to use for any item.',
    });
  };

  const handleAddProductLine = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const isOOS = Number(newLineQty) > prod.freeToUse;
    const newItem = {
      id: `item-${Date.now()}`,
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      uom: prod.uom,
      quantityDemanded: Number(newLineQty),
      quantityDone: Number(newLineQty),
      unitPrice: prod.perUnitCost,
      isOutOfStock: isOOS,
    };

    const newStatus = isOOS || hasOutOfStockItems ? 'Waiting' : operation.status;

    updateOperation(operation.id, {
      items: [...operation.items, newItem],
      status: newStatus,
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
          href="/operations/deliveries"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Deliveries List
        </Link>

        {/* New button matching Excalidraw */}
        <Link
          href="/operations/deliveries/new"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          + New Delivery
        </Link>
      </div>

      {/* Main Document Box */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Action Header Bar (Matching Excalidraw: Validate / Print / Cancel) */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* When in Draft / Waiting: Validate check */}
            {(operation.status === 'Draft' || operation.status === 'Waiting') && (
              <>
                <button
                  onClick={() => handleAction('Ready')}
                  disabled={hasOutOfStockItems}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Check Availability (Mark Ready)
                </button>

                {/* Backorder Splitting Action when blocked by out-of-stock */}
                {hasOutOfStockItems && (
                  <button
                    onClick={handleSplitBackorder}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
                  >
                    <Split className="h-4 w-4" />
                    Split & Create Backorder
                  </button>
                )}
              </>
            )}

            {/* When in Ready: "Validate" moves to Done */}
            {operation.status === 'Ready' && (
              <button
                onClick={() => handleAction('Done')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Validate (Dispatch Goods)
              </button>
            )}

            {/* When in Done: "Print" button becomes active (per Excalidraw) */}
            {operation.status === 'Done' && (
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Delivery Slip
              </button>
            )}

            {/* Cancel Button */}
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

          {/* Pipeline State Ribbon (Draft > Waiting > Ready > Done per Excalidraw) */}
          <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200 shadow-2xs text-xs font-bold">
            <span
              className={`px-2.5 py-1 rounded-lg ${
                operation.status === 'Draft' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Draft
            </span>
            <span className="text-slate-300 px-1">&gt;</span>
            <span
              className={`px-2.5 py-1 rounded-lg ${
                operation.status === 'Waiting'
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-400'
              }`}
            >
              Waiting
            </span>
            <span className="text-slate-300 px-1">&gt;</span>
            <span
              className={`px-2.5 py-1 rounded-lg ${
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
              className={`px-2.5 py-1 rounded-lg ${
                operation.status === 'Done' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Done
            </span>
          </div>
        </div>

        {/* Out-of-Stock Red Banner Alert (Explicit Excalidraw Rule) */}
        {hasOutOfStockItems && operation.status !== 'Done' && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-900 block">Out of Stock Alert!</span>
                <span>
                  One or more line items exceed current free-to-use warehouse inventory. Order cannot be validated until
                  replenished or split into a backorder.
                </span>
              </div>
            </div>
            <button
              onClick={handleSplitBackorder}
              className="ml-4 shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700 shadow-2xs"
            >
              Split Backorder Now
            </button>
          </div>
        )}

        {/* Feedback Alert */}
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

        {/* Form Body matching Excalidraw layout */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operation / Outbound</span>
              <h2 className="text-3xl font-mono font-black text-slate-900 tracking-tight mt-0.5">
                {operation.reference}
              </h2>
            </div>
            <div className="text-sm font-semibold text-slate-500">
              Warehouse Facility: <strong className="text-slate-800">{operation.warehouseCode}</strong>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Delivery Address / Customer Contact
              </label>
              <input
                type="text"
                disabled={operation.status === 'Done'}
                value={operation.contactName}
                onChange={(e) => updateOperation(operation.id, { contactName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Source Storage Location
              </label>
              <input
                type="text"
                disabled={operation.status === 'Done'}
                value={operation.sourceLocationCode}
                onChange={(e) => updateOperation(operation.id, { sourceLocationCode: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Schedule Date
              </label>
              <input
                type="date"
                disabled={operation.status === 'Done'}
                value={operation.scheduledDate}
                onChange={(e) => updateOperation(operation.id, { scheduledDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Responsible (Auto-filled)
              </label>
              <input
                type="text"
                disabled={operation.status === 'Done'}
                value={operation.responsible}
                onChange={(e) => updateOperation(operation.id, { responsible: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Products Line Items (Explicit Excalidraw rule: Mark line RED if out of stock!) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Products Demanded</span>
              <span className="text-xs text-slate-400">
                {itemsWithStock.length} line{itemsWithStock.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-center">Unit Price</th>
                    <th className="px-6 py-3 text-center">Free to Use</th>
                    <th className="px-6 py-3 text-right">Qty Demanded</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                    {operation.status !== 'Done' && <th className="px-6 py-3 text-right">Remove</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {itemsWithStock.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        item.isOutOfStock && operation.status !== 'Done'
                          ? 'bg-rose-100/80 text-rose-900 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Product SKU & Name */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold block">{item.name}</span>
                            <span className="font-mono text-[11px] opacity-75">[{item.sku}]</span>
                          </div>
                          {item.isOutOfStock && operation.status !== 'Done' && (
                            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-3.5 text-center text-slate-600">{formatCurrency(item.unitPrice)}</td>

                      {/* Free to Use in warehouse */}
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`font-bold font-mono ${
                            item.isOutOfStock && operation.status !== 'Done'
                              ? 'text-rose-700'
                              : 'text-indigo-600'
                          }`}
                        >
                          {item.freeToUse} {item.uom}
                        </span>
                      </td>

                      {/* Quantity Demanded */}
                      <td className="px-6 py-3.5 text-right font-black text-sm">
                        {item.quantityDemanded} {item.uom}
                      </td>

                      {/* Subtotal */}
                      <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                        {formatCurrency(item.unitPrice * item.quantityDemanded)}
                      </td>

                      {/* Remove line */}
                      {operation.status !== 'Done' && (
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
                className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs"
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="block font-bold text-slate-700 mb-1">Select Product to Deliver</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.sku}] {p.name} (Free: {p.freeToUse} {p.uom})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={newLineQty}
                    onChange={(e) => setNewLineQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 transition-colors"
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
