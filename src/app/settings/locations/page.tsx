'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { MapPin, Plus, Edit2, X } from 'lucide-react';

export default function LocationsSettingsPage() {
  const { locations, warehouses, addLocation, updateLocation } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLoc, setEditLoc] = useState<any>(null);

  // Form state matching Excalidraw: Name, Short Code, warehouse
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [zone, setZone] = useState('Zone A - General Storage');
  const [capacity, setCapacity] = useState(200);

  const internalLocations = locations.filter((l) => l.type === 'internal');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortCode.trim()) return;

    const wh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];

    addLocation({
      name: name.trim(),
      shortCode: shortCode.trim(),
      warehouseId: wh.id,
      warehouseCode: wh.shortCode,
      type: 'internal',
      zone,
      capacity: Number(capacity),
      currentFill: 20,
    });

    setShowAddModal(false);
    setName('');
    setShortCode('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLoc) return;

    updateLocation(editLoc.id, {
      name: editLoc.name,
      shortCode: editLoc.shortCode,
      zone: editLoc.zone,
      capacity: Number(editLoc.capacity),
    });

    setEditLoc(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header matching Excalidraw "location" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Settings</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Storage Locations & Bins</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            This holds the multiple locations of warehouse, rooms, racks, and assembly floors.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {internalLocations.map((loc) => (
          <div
            key={loc.id}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl space-y-3 hover:border-indigo-500/40 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                  <span className="font-mono text-xs font-bold text-indigo-400">{loc.shortCode}</span>
                </div>
              </div>

              <button
                onClick={() => setEditLoc(loc)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-3.5 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Warehouse:</span>
                <strong className="text-white font-mono">{loc.warehouseCode}</strong>
              </div>
              {loc.zone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Zone:</span>
                  <span className="text-slate-300 font-medium">{loc.zone}</span>
                </div>
              )}
              {loc.capacity && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="text-emerald-400 font-mono font-bold">{loc.capacity} Units</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Location */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Add Storage Location</h3>
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
                  placeholder="e.g. Stock Area 1 (Racks A-C)"
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
                  placeholder="e.g. WH/Stock1"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 font-mono px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Warehouse:</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                      {w.shortCode} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Zone / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Zone A"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Capacity Units</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
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
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Location */}
      {editLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Edit Location</h3>
              <button onClick={() => setEditLoc(null)} className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Name:</label>
                <input
                  type="text"
                  required
                  value={editLoc.name}
                  onChange={(e) => setEditLoc({ ...editLoc, name: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Short Code:</label>
                <input
                  type="text"
                  required
                  value={editLoc.shortCode}
                  onChange={(e) => setEditLoc({ ...editLoc, shortCode: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-800/80 font-mono px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Zone / Room</label>
                  <input
                    type="text"
                    value={editLoc.zone || ''}
                    onChange={(e) => setEditLoc({ ...editLoc, zone: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Capacity Units</label>
                  <input
                    type="number"
                    min={1}
                    value={editLoc.capacity || 200}
                    onChange={(e) => setEditLoc({ ...editLoc, capacity: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditLoc(null)}
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
