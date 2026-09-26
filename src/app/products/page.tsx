'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { formatNumber, formatCurrency } from '@/lib/utils';
import {
  Package,
  Plus,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  Building2,
  X,
} from 'lucide-react';

export default function ProductsPage() {
  const { products, addProduct, quickAdjustStock } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustModalProduct, setAdjustModalProduct] = useState<any>(null);
  const [drilldownProduct, setDrilldownProduct] = useState<any>(null);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Furniture');
  const [newUom, setNewUom] = useState('Units');
  const [newCost, setNewCost] = useState(1000);
  const [newInitialStock, setNewInitialStock] = useState(0);
  const [newMinThreshold, setNewMinThreshold] = useState(10);
  const [newTargetMax, setNewTargetMax] = useState(50);

  // Stock adjust form state
  const [adjustLocation, setAdjustLocation] = useState('WH/Stock1');
  const [countedQty, setCountedQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Annual physical inventory audit');

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim()) return;

    addProduct({
      name: newName.trim(),
      sku: newSku.trim().toUpperCase(),
      category: newCategory,
      uom: newUom,
      perUnitCost: Number(newCost),
      minReorderThreshold: Number(newMinThreshold),
      targetMaxQuantity: Number(newTargetMax),
      onHand: Number(newInitialStock),
      locationStocks: {
        'WH/Stock1': Number(newInitialStock),
      },
      description: 'Added via StockSense Catalog',
    });

    setShowAddModal(false);
    // Reset form
    setNewName('');
    setNewSku('');
    setNewInitialStock(0);
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct) return;
    quickAdjustStock(adjustModalProduct.id, adjustLocation, Number(countedQty), adjustReason);
    setAdjustModalProduct(null);
  };

  // Compute quick catalog statistics
  const totalValuation = products.reduce((acc, p) => acc + p.onHand * p.perUnitCost, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.onHand, 0);
  const lowStockCount = products.filter((p) => p.freeToUse <= p.minReorderThreshold).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Inventory Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Stock & Products</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time on-hand counts, free-to-use availability, and inline stock updates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Unique SKUs</span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{products.length}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Active catalog items</span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Physical Units</span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{formatNumber(totalUnits)}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Located in all warehouses</span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Low Stock SKUs</span>
          <div className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
            {lowStockCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Triggered safety reorder</span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Valuation</span>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(totalValuation)}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Aggregate book value</span>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name or SKU (e.g. DESK001, Table)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-xl backdrop-blur-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800/80 focus:outline-hidden"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 px-3.5 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm dark:shadow-xl backdrop-blur-xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800/80 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table matching Excalidraw columns */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Product & SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Per Unit Cost</th>
                <th className="px-6 py-3.5">On Hand</th>
                <th className="px-6 py-3.5">Free to Use</th>
                <th className="px-6 py-3.5">Reorder Rule</th>
                <th className="px-6 py-3.5 text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
              {paginatedProducts.map((p) => {
                const isLowStock = p.freeToUse <= p.minReorderThreshold;
                const availabilityPct = p.onHand > 0 ? Math.min(100, Math.round((p.freeToUse / p.onHand) * 100)) : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Product & SKU */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-mono font-bold text-xs shadow-inner">
                          {p.sku.substring(0, 3)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">{p.name}</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">[{p.sku}]</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {p.category}
                      </span>
                    </td>

                    {/* Per Unit Cost */}
                    <td className="px-6 py-4 font-bold font-mono text-slate-800 dark:text-slate-200">
                      {formatCurrency(p.perUnitCost)}
                    </td>

                    {/* On Hand */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDrilldownProduct(p)}
                        className="font-bold font-mono text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                        title="Click to view locations breakdown"
                      >
                        {p.onHand} {p.uom}
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </td>

                    {/* Free to Use with visual meter */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-black font-mono ${
                              isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {p.freeToUse} {p.uom}
                          </span>
                          {isLowStock && (
                            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Low Stock
                            </span>
                          )}
                        </div>
                        {/* Mini Availability Bar */}
                        <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${availabilityPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Reorder Rule */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      Min: <strong className="text-slate-700 dark:text-slate-200 font-mono">{p.minReorderThreshold}</strong> | Max:{' '}
                      <strong className="text-slate-700 dark:text-slate-200 font-mono">{p.targetMaxQuantity}</strong>
                    </td>

                    {/* Quick Update Stock Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustModalProduct(p);
                          setCountedQty(p.onHand);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all cursor-pointer active:scale-95"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Adjust Count
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5 px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong> products
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <React.Fragment key={page}>
                      {prev && page - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Quick Adjust Stock Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Physical Stock Count Adjustment</h3>
              </div>
              <button
                onClick={() => setAdjustModalProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">{adjustModalProduct.name}</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">SKU: {adjustModalProduct.sku}</span>
              <div className="pt-2 flex justify-between text-slate-700 dark:text-slate-300 font-semibold font-mono">
                <span>Recorded On-Hand: {adjustModalProduct.onHand} {adjustModalProduct.uom}</span>
                <span>Free to Use: {adjustModalProduct.freeToUse} {adjustModalProduct.uom}</span>
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Location Bin</label>
                <select
                  value={adjustLocation}
                  onChange={(e) => setAdjustLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="WH/Stock1">WH/Stock1 (Stock Area 1)</option>
                  <option value="WH/Stock2">WH/Stock2 (Stock Area 2)</option>
                  <option value="WH/Production">WH/Production (Production Floor)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Counted Physical Quantity ({adjustModalProduct.uom})
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={countedQty}
                  onChange={(e) => setCountedQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm font-bold font-mono text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-mono">
                  Discrepancy: {countedQty - (adjustModalProduct.locationStocks[adjustLocation] || 0)} {adjustModalProduct.uom}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 cursor-pointer"
                >
                  Apply & Log Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock Availability Per Location Drilldown */}
      {drilldownProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Stock Availability Per Location</h3>
              </div>
              <button
                onClick={() => setDrilldownProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{drilldownProduct.name}</h4>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">SKU: {drilldownProduct.sku}</p>
            </div>

            <div className="space-y-2">
              {Object.entries(drilldownProduct.locationStocks).map(([locCode, qty]) => (
                <div
                  key={locCode}
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{locCode}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Warehouse Bin Location</span>
                  </div>
                  <span className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {qty as number} {drilldownProduct.uom}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              <span>Total On Hand:</span>
              <span>
                {drilldownProduct.onHand} {drilldownProduct.uom}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Create Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product to Catalog</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Office Desk"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DESK001"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 font-mono text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Furniture"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure (UoM)</label>
                  <select
                    value={newUom}
                    onChange={(e) => setNewUom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Units">Units</option>
                    <option value="kg">kg</option>
                    <option value="meters">meters</option>
                    <option value="boxes">boxes</option>
                    <option value="liters">liters</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Per Unit Cost (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs font-mono text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs font-mono text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Reorder Alert</label>
                  <input
                    type="number"
                    min={0}
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs font-mono text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Max Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={newTargetMax}
                    onChange={(e) => setNewTargetMax(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs font-mono text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-2.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 cursor-pointer"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
