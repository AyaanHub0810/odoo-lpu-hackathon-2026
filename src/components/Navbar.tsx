'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useTheme } from '@/context/ThemeContext';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  History,
  Building2,
  MapPin,
  QrCode,
  Map,
  LogOut,
  ChevronDown,
  RotateCcw,
  Box,
  Search,
  Command,
  Sun,
  Moon,
  Bell,
  Sparkles,
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import BarcodeScannerModal from './BarcodeScannerModal';
import WarehouseVisualMapModal from './WarehouseVisualMapModal';
import CommandMenu from './ui/CommandMenu';
import NotificationsPopover from './ui/NotificationsPopover';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, resetAllData } = useInventory();
  const { theme, toggleTheme } = useTheme();
  const { isSignedIn } = useUser();

  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Proactively prefetch all routes in background so clicking is instantaneous
  useEffect(() => {
    const prefetchRoutes = [
      '/dashboard',
      '/operations/receipts',
      '/operations/deliveries',
      '/operations/transfers',
      '/operations/adjustments',
      '/products',
      '/warehouse-3d',
      '/move-history',
      '/settings/warehouses',
    ];
    prefetchRoutes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  // If on landing or auth pages, don't show navigation
  if (
    pathname === '/' ||
    pathname === '/landing' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  ) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300',
    },
    {
      title: 'Receipts (+IN)',
      href: '/operations/receipts',
      icon: ArrowDownLeft,
      color: 'text-emerald-500 group-hover:text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300',
      badge: 'Vendor',
    },
    {
      title: 'Deliveries (-OUT)',
      href: '/operations/deliveries',
      icon: ArrowUpRight,
      color: 'text-rose-500 group-hover:text-rose-600 dark:text-rose-400',
      activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-300',
      badge: 'Dispatch',
    },
    {
      title: 'Transfers',
      href: '/operations/transfers',
      icon: ArrowLeftRight,
      color: 'text-cyan-500 group-hover:text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300',
    },
    {
      title: 'Adjustments',
      href: '/operations/adjustments',
      icon: SlidersHorizontal,
      color: 'text-amber-500 group-hover:text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300',
    },
    {
      title: 'Products & SKUs',
      href: '/products',
      icon: Package,
      color: 'text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-300',
    },
    {
      title: '3D Digital Twin',
      href: '/warehouse-3d',
      icon: Box,
      color: 'text-purple-500 group-hover:text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-300',
      live: true,
    },
    {
      title: 'Stock Ledger',
      href: '/move-history',
      icon: History,
      color: 'text-cyan-500 group-hover:text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300',
    },
    {
      title: 'Facilities & Bins',
      href: '/settings/warehouses',
      icon: Building2,
      color: 'text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white',
      activeBg: 'bg-slate-500/15 border-slate-500/40 text-slate-700 dark:text-slate-200',
    },
  ];

  return (
    <>
      {/* Floating Apple-Style Magnification Dock Header */}
      <header className="sticky top-2.5 z-40 mx-auto w-full max-w-7xl px-3 transition-all duration-300 flex items-center justify-between">
        
        {/* Brand identity chip */}
        <Link
          href="/dashboard"
          className="hidden md:flex items-center gap-2.5 rounded-full border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-[#090d16]/85 px-3 py-1.5 shadow-sm backdrop-blur-xl group hover:border-indigo-400/50 transition-all flex-shrink-0"
        >
          <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full p-[1px] bg-gradient-to-tr from-indigo-500 to-cyan-400 shadow-sm">
            <div className="h-full w-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <Image
                src="/stocksense-logo.jpg"
                alt="StockSense Logo"
                width={26}
                height={26}
                className="object-cover rounded-full"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
              Stock<span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Sense</span>
            </span>
            <div className="flex items-center gap-1 text-[8px] font-mono text-slate-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
              <span>WH-CENTRAL</span>
            </div>
          </div>
        </Link>

        {/* Apple-Style Fluid Magnification Dock */}
        <div className="mx-auto flex-1 max-w-fit px-1">
          <Dock
            panelHeight={56}
            magnification={74}
            distance={130}
            className="border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#090d16]/85 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.1),0_0_24px_rgba(99,102,241,0.08)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.85),0_0_24px_rgba(99,102,241,0.15)]"
          >
            {/* Primary Nav Items */}
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <DockItem
                  key={item.href}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onClick={() => router.push(item.href)}
                  className={`aspect-square transition-all group ${
                    active
                      ? `${item.activeBg} border shadow-sm`
                      : 'border border-transparent hover:border-slate-200/60 dark:hover:border-white/8 hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <DockLabel>{item.title}</DockLabel>
                  <DockIcon>
                    <div className="relative flex items-center justify-center h-full w-full">
                      <Icon className={`h-full w-full transition-colors ${item.color}`} />
                      {/* Active Indicator Pip */}
                      {active && (
                        <span className="absolute -bottom-1.5 flex h-1 w-1 rounded-full bg-indigo-500 dark:bg-cyan-400 shadow-[0_0_6px_rgba(99,102,241,1)]" />
                      )}
                      {/* Live 3D ping */}
                      {item.live && !active && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                      )}
                    </div>
                  </DockIcon>
                </DockItem>
              );
            })}

            {/* Separator */}
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-0.5 self-center" />

            {/* Action 1: Quick Command Search (⌘K) */}
            <DockItem
              onClick={() => setShowCommandMenu(true)}
              className="aspect-square border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100/80 dark:hover:bg-white/5"
            >
              <DockLabel>Quick Command (⌘K)</DockLabel>
              <DockIcon>
                <Search className="h-full w-full text-slate-500 dark:text-slate-400" />
              </DockIcon>
            </DockItem>

            {/* Action 2: Barcode / SKU Scanner HUD */}
            <DockItem
              onClick={() => setShowScanner(true)}
              className="aspect-square border border-transparent hover:border-indigo-400/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40"
            >
              <DockLabel>Scan Barcode HUD</DockLabel>
              <DockIcon>
                <QrCode className="h-full w-full text-indigo-600 dark:text-indigo-400" />
              </DockIcon>
            </DockItem>

            {/* Action 3: 2D Interactive Warehouse Floor Map */}
            <DockItem
              onClick={() => setShowMap(true)}
              className="aspect-square border border-transparent hover:border-emerald-400/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40"
            >
              <DockLabel>2D Floor Map</DockLabel>
              <DockIcon>
                <Map className="h-full w-full text-emerald-600 dark:text-emerald-400" />
              </DockIcon>
            </DockItem>

            {/* Action 4: Theme Toggle (Sun / Moon) */}
            <DockItem
              onClick={toggleTheme}
              className="aspect-square border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100/80 dark:hover:bg-white/5"
            >
              <DockLabel>{theme === 'dark' ? 'Light Theme' : 'Cyber Dark Theme'}</DockLabel>
              <DockIcon>
                {theme === 'dark' ? (
                  <Sun className="h-full w-full text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="h-full w-full text-indigo-600 hover:-rotate-12 transition-transform" />
                )}
              </DockIcon>
            </DockItem>
          </Dock>
        </div>

        {/* Right Pod: Notifications & User Capsule */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <NotificationsPopover />

          {/* User Button */}
          {mounted && isSignedIn ? (
            <div className="ring-2 ring-indigo-500/40 rounded-full p-0.5">
              <UserButton />
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-xs font-black text-white shadow-md ring-2 ring-slate-200 dark:ring-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={user?.fullName || 'User Profile'}
              >
                {user?.avatar || 'A'}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 8 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    onMouseLeave={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-3 w-72 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
                  >
                    <div className="border-b border-slate-100 dark:border-white/10 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-xs font-black text-white shadow-md">
                          {user?.avatar || 'A'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {user?.fullName || 'Alex Morgan'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[170px]">
                            {user?.email || 'admin@stocksense.io'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                          Clearance
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.2 rounded-full font-mono">
                          {user?.role || 'Lead Ops Admin'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          resetAllData();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                        Reset Demo Data
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push('/login');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {/* Global Interactive Modals */}
      <CommandMenu isOpen={showCommandMenu} onClose={() => setShowCommandMenu(false)} />
      {showScanner && <BarcodeScannerModal onClose={() => setShowScanner(false)} />}
      {showMap && <WarehouseVisualMapModal onClose={() => setShowMap(false)} />}
    </>
  );
}
