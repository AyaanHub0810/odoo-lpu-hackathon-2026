# StockSense — Master Project Task Tracker (`task.md`)

**Project:** StockSense — Centralized Real-Time Inventory Management System (IMS) & 3D Digital Twin  
**Current Date:** September 2026  
**Status Overview:** Full Stack WMS Complete · Clerk Auth Synced · MongoDB Atlas Connected & Seeded · UI/UX Polished  

---

## 📊 High-Level Status Dashboard

| Category | Modules / Features | Completion |
|---|---|:---:|
| **Core Architecture & Data** | Context State, Types, LocalStorage Persistence, Seed Data | 100% |
| **Cloud Database (MongoDB)** | MongoDB Atlas (`alienx.mongodb.net`), Seed API, Data Sync | 100% |
| **Authentication & Auth UI** | Custom Login/Signup/OTP + Clerk SSO Sync & Direct Redirects | 100% |
| **Dashboard & Analytics** | KPI Cards, Multi-filter, Live Health, Fast Inbound/Outbound | 100% |
| **Products Management** | SKU Directory, Stock Breakdown, Reorder Minimums, UoM | 100% |
| **Operations Engine** | Receipts, Deliveries, Transfers, Adjustments | 100% |
| **Immutable Stock Ledger** | Move History (`/move-history`), Double-Entry Ledger, Audit Trail | 100% |
| **3D Digital Twin** | Three.js Scene, Pallet Stacks, AGVs, Live Receipt Updates | 100% |
| **2D Interactive Floor Map** | Modal, Zone Selector (A/B/C), Bin Heatmaps, Staggered Motion | 100% |
| **Hardware / Barcode Scanner** | `html5-qrcode` Camera Scanner Modal | 100% |
| **Navigation & Dock** | Apple-Style Dock, Magnification, Quick Command (⌘K) | 98% |
| **Demo Data & Cloud Hub** | Floating Dockable Demo Data Widget with 1-click MongoDB reload | 100% |
| **UI Theme & Visual Polish** | Dual Dark/Light Theme across all sub-pages & dropdowns | 90% |

---

## ✅ Completed Tasks

### 1. Cloud Database & Demo Data Sync (MongoDB Atlas)
- [x] Configured `MONGODB_URI` environment variable pointing to MongoDB Atlas cluster `alienx.xqokaet.mongodb.net/stocksense`.
- [x] Installed `mongodb` driver and created singleton client connection pool (`src/lib/mongodb.ts`).
- [x] Implemented `/api/mongodb/seed` route: Atomically clears and populates `warehouses`, `locations`, `products`, `operations`, and `stock_moves` in MongoDB.
- [x] Implemented `/api/mongodb/data` route: Dual `GET` (fetch cloud data) and `POST` (sync client data to Atlas).
- [x] Created `DemoDataWidget` (`src/components/DemoDataWidget.tsx`):
  - Floating card on initial login / mount with "Load Sample Demo Data".
  - One-click seeds & loads data from MongoDB Atlas.
  - Automatically docks to the right side of the screen as a sleek tab with live status pulse.
  - Accessible anytime to reload demo data or sync to cloud.

### 2. Clerk SSO Authentication & Direct Redirect Fix
- [x] Resolved root page infinite loading ("Loading StockSense WMS..."):
  - Updated `src/app/page.tsx` to inspect Clerk's `useUser()` (`isLoaded`, `isSignedIn`) as well as local context user.
  - Direct instant redirection to `/dashboard` when authenticated via Clerk.
  - Added `forceRedirectUrl="/dashboard"` to Clerk's `<SignInButton>` on `/login`.
  - Added auto-redirect on `/login` if user is already authenticated.
- [x] Linked Clerk User profile to `InventoryContext`:
  - Automatically maps Clerk `id`, `fullName`, `email`, and `imageUrl` to the active inventory user session.

### 3. Core State & Data Flow
- [x] **Global Inventory Context (`src/context/InventoryContext.tsx`):**
  - Products, Warehouses, Locations, Operations, and Ledger moves.
  - Double-entry atomic stock ledger updates on operation validation.
  - Automatic `Free to Use` recalculation: $\text{Free} = \text{On Hand} - \sum \text{Allocated in Ready Deliveries}$.
  - Out-of-stock guard logic (prevents delivery validation if stock is deficient).
  - Persistence via `localStorage` + optional MongoDB cloud backup.

### 4. Operations Workflows
- [x] **Receipts (`/operations/receipts`, `/operations/receipts/new`, `/operations/receipts/[id]`):**
  - Incoming vendor shipments (`WH/IN/000X`).
  - Draft $\to$ Ready $\to$ Done state machine.
  - Automatic inventory crediting and emerald ledger move creation.
  - Printable receipt slips with scannable barcode and QR code.
- [x] **Deliveries (`/operations/deliveries`, `/operations/deliveries/new`, `/operations/deliveries/[id]`):**
  - Outbound customer dispatches (`WH/OUT/000X`).
  - Insufficient stock warnings (amber/red badges).
  - Atomic stock deductions and rose-red ledger move creation.
  - Printable delivery packing slips.
- [x] **Internal Transfers (`/operations/transfers`, `/operations/transfers/new`, `/operations/transfers/[id]`):**
  - Inter-bin stock movements (`WH/INT/000X`).
  - Preserves overall company stock while updating per-location inventory.
- [x] **Stock Adjustments (`/operations/adjustments`):**
  - Physical reconciliation workflow (`WH/ADJ/000X`).
  - Auto-computes discrepancy between recorded book stock and physical count.
  - Dual light/dark themed input cards and ledger compensation logging.

### 5. Visual & Interactive Tools
- [x] **3D Warehouse Digital Twin (`/warehouse-3d`):**
  - Standalone Three.js interactive 3D spatial viewer (`ThreeWarehouseViewer.tsx`).
  - Realistic multi-bay racking, dynamic colored pallets based on actual stock levels.
  - Animated Autonomous Guided Vehicles (AGVs) patrolling aisles.
  - Real-time event subscription: validates receipts and dynamically generates pallet stacks.
  - "Receive Inbound Pallet" quick simulation action.
- [x] **Redesigned 2D Interactive Warehouse Floor Map Modal (`WarehouseVisualMapModal.tsx`):**
  - Modal with spring entrance and backdrop blur.
  - Zone selector tabs (Zone A - Fast Moving, Zone B - High Bay Storage, Zone C - Bulk & Hazardous).
  - Animated bin cards with real-time percentage heatmaps and stock indicators.
  - Dual light and dark mode styling.
- [x] **Barcode & QR Camera Scanner (`BarcodeScannerModal.tsx`):**
  - Live video stream scanning using `html5-qrcode`.
  - Instant SKU lookup with sound feedback and redirection.
- [x] **Command Menu (`CommandMenu.tsx`):**
  - Quick action launcher via `⌘K` or dock search icon.

### 6. Apple-Style Dock Navbar Enhancements
- [x] Implemented spring magnification dock (`src/components/ui/dock.tsx`).
- [x] Refined active selection circle to a sleek indicator pip.
- [x] Solved tooltip clipping:
  - Repositioned tooltips below the dock (`-bottom-11`) with upward-pointing caret arrow.
  - Added `overflow-visible` to dock container.
  - Added dual `onMouseEnter` / `onMouseLeave` + `onHoverStart` / `onHoverEnd` to guarantee desktop event firing.
  - Set tooltip `z-[100]`.

---

## ⏳ In Progress / Testing

- [x] **MongoDB Atlas Connectivity Test:** Verified via `/api/mongodb/seed` — Collections seeded successfully.
- [x] **TypeScript Validation:** `npx tsc --noEmit` passing with 0 errors.

---

## 📌 Left to Do (Remaining Minor Polish)

### Priority 1: Complete Dual-Theme Coverage Across Remaining Forms
The core dashboard, adjustments, and dropdown `<option>` tags are dual-themed. Remaining sub-forms to polish:
- [ ] `src/app/operations/transfers/new/page.tsx` — Add `dark:bg-slate-900/80 dark:border-white/10 dark:text-white dark:bg-slate-800`.
- [ ] `src/app/operations/deliveries/new/page.tsx` — Add dual-theme classes to form card, product selector, and quantity inputs.
- [ ] `src/app/operations/receipts/new/page.tsx` — Add dual-theme classes to form card, supplier inputs, and destination selects.
- [ ] `src/app/settings/locations/page.tsx` — Update location creation modal and list table for dark mode.
- [ ] `src/app/settings/warehouses/page.tsx` — Update facility cards and form inputs for dark mode.

---

## 🛠️ Verification Checklist

| View / Function | Route | Test Action | Expected Result | Status |
|---|---|---|---|:---:|
| **Clerk Login** | `/login` | Sign in with Clerk SSO | Redirects directly to `/dashboard` with no infinite loading | ✅ Fixed |
| **Demo Data Hub** | Global | Click "Load Sample Demo Data" | Instantly seeds MongoDB Atlas and updates dashboard | ✅ Added |
| **Dockable Tab** | Global | Click "Dock" on widget | Minimizes to sleek right-side tab with MongoDB pulse | ✅ Added |
| **Dock Navbar** | Global | Hover each dock icon | Tooltip appears below dock with title | ✅ Verified |
| **Theme Toggle** | Global | Click Sun/Moon icon | Instant seamless toggle between dark & light | ✅ Verified |
| **2D Floor Map** | `/dashboard` | Click Map in Dock | Modern modal with Zone tabs & bin heatmaps | ✅ Verified |
| **3D Digital Twin** | `/warehouse-3d` | Click "Receive Inbound Pallet" | Pallet appears in 3D bay and notification fires | ✅ Verified |
| **Ledger Audit** | `/move-history` | Validate any receipt/delivery | New row added with emerald/rose tag | ✅ Verified |
