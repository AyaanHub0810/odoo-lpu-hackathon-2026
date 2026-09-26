'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function NewTransferPage() {
  const router = useRouter();
  const { warehouses, locations, products, createOperation } = useInventory();

  const internalLocations = locations.filter((l) => l.type === 'internal');

  const warehouseId = warehouses[0]?.id || '';
  const [sourceLocationId, setSourceLocationId] = useState(internalLocations[0]?.id || '');
  const [destinationLocationId, setDestinationLocationId] = useState(internalLocations[1]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 5 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceLocationId === destinationLocationId) {
      alert('Source and destination locations cannot be identical.');
      return;
    }

    const newOp = createOperation({
      operationType: 'INTERNAL',
      warehouseId,
      sourceLocationId,
      destinationLocationId,
      contactName: 'Internal Transfer',
      scheduledDate,
      items: items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })),
      notes,
    });

    router.push(`/operations/transfers/${newOp.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Link
        href="/operations/transfers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Transfers List
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Inter-Facility Movements</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Create Internal Stock Transfer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Move inventory between bins (e.g. Main Store &rarr; Production Floor). Total stock remains constant.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Source Location (From)
              </label>
              <select
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              >
                {internalLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.shortCode} - {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Location (To)
              </label>
              <select
                value={destinationLocationId}
                onChange={(e) => setDestinationLocationId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              >
                {internalLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.shortCode} - {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Products to Transfer</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-slate-100"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                >
                  <div className="flex-1">
                    <label className="block font-semibold text-slate-500 text-[10px] mb-1">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.sku}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <label className="block font-semibold text-slate-500 text-[10px] mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 mt-4 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Internal transfer rationale or work order reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Link
              href="/operations/transfers"
              className="flex-1 rounded-xl border border-slate-200 py-3 text-center font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Create Transfer Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
