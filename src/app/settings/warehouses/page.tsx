'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Building2, Plus, Edit2, X } from 'lucide-react';

export default function WarehousesSettingsPage() {
  const { warehouses, addWarehouse, updateWarehouse } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editWh, setEditWh] = useState<any>(null);

  // Form state matching Excalidraw: Name, Short Code, Address
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [address, setAddress] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortCode.trim()) return;

    addWarehouse({
      name: name.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      address: address.trim(),
      isActive: true,
    });

    setShowAddModal(false);
    setName('');
    setShortCode('');
    setAddress('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWh) return;

    updateWarehouse(editWh.id, {
      name: editWh.name,
      shortCode: editWh.shortCode.toUpperCase(),
      address: editWh.address,
    });

    setEditWh(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header matching Excalidraw "Warehouse" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Settings</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Warehouse Facilities</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            This page contains the warehouse details & location settings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Warehouse
        </button>
      </div>

      {/* Warehouses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl space-y-4 hover:border-indigo-500/40 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{wh.name}</h3>
                  <span className="font-mono text-xs font-bold text-indigo-400">Code: {wh.shortCode}</span>
                </div>
              </div>

              <button
                onClick={() => setEditWh(wh)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Facility Address:
              </span>
              <p className="font-medium text-slate-300">{wh.address || 'Address not configured.'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Warehouse */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Add Warehouse Facility</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Warehouse"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Short Code:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 font-mono px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Address:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Plot 42, Logistics Park..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Warehouse */}
      {editWh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Edit Warehouse</h3>
              <button onClick={() => setEditWh(null)} className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Name:</label>
                <input
                  type="text"
                  required
                  value={editWh.name}
                  onChange={(e) => setEditWh({ ...editWh, name: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Short Code:</label>
                <input
                  type="text"
                  required
                  value={editWh.shortCode}
                  onChange={(e) => setEditWh({ ...editWh, shortCode: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 font-mono px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Address:</label>
                <textarea
                  rows={2}
                  value={editWh.address}
                  onChange={(e) => setEditWh({ ...editWh, address: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditWh(null)}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
