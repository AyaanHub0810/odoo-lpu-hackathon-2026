'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  User,
  Warehouse,
  Location,
  Product,
  Operation,
  StockMove,
  OperationType,
  OperationStatus,
  DashboardStats,
} from '@/types/inventory';
import {
  INITIAL_USER,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_OPERATIONS,
  INITIAL_STOCK_MOVES,
} from '@/lib/initialData';

interface InventoryContextType {
  user: User | null;
  users: Array<{ loginId: string; email: string; passwordHash: string; fullName: string; role: User['role'] }>;
  warehouses: Warehouse[];
  locations: Location[];
  products: Product[];
  operations: Operation[];
  stockMoves: StockMove[];
  otpStore: Record<string, string>; // emailOrLoginId -> 6-digit OTP
  isMongoConnected: boolean;

  // Auth Actions
  login: (loginId: string, password: string) => { success: boolean; error?: string };
  signup: (data: { loginId: string; email: string; password: string; fullName?: string }) => { success: boolean; error?: string };
  requestOtp: (identifier: string) => { success: boolean; otp?: string; error?: string };
  resetPasswordWithOtp: (identifier: string, otp: string, newPassword: string) => { success: boolean; error?: string };
  logout: () => void;

  // Demo & MongoDB Data Actions
  loadDemoData: (source?: 'local' | 'mongodb') => Promise<{ success: boolean; message: string }>;
  syncToMongoDB: () => Promise<{ success: boolean; message: string }>;

  // Master Data Actions
  addWarehouse: (wh: Omit<Warehouse, 'id' | 'createdAt'>) => Warehouse;
  updateWarehouse: (id: string, wh: Partial<Warehouse>) => void;
  addLocation: (loc: Omit<Location, 'id'>) => Location;
  updateLocation: (id: string, loc: Partial<Location>) => void;
  addProduct: (product: Omit<Product, 'id' | 'freeToUse' | 'createdAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  quickAdjustStock: (productId: string, locationCode: string, countedQty: number, reason: string) => void;

  // Operations Actions
  createOperation: (data: {
    operationType: OperationType;
    warehouseId: string;
    sourceLocationId: string;
    destinationLocationId: string;
    contactName: string;
    deliveryAddress?: string;
    scheduledDate: string;
    items: Array<{ productId: string; quantity: number }>;
    notes?: string;
  }) => Operation;
  updateOperation: (id: string, data: Partial<Operation>) => void;
  transitionOperationStatus: (id: string, nextStatus: OperationStatus) => { success: boolean; message?: string };
  deleteOperation: (id: string) => void;
  recomputeStockBalances: () => void;

  // Analytics
  getDashboardStats: () => DashboardStats;
  resetAllData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'stocksense_current_user_v1',
  USERS_LIST: 'stocksense_users_list_v1',
  WAREHOUSES: 'stocksense_warehouses_v1',
  LOCATIONS: 'stocksense_locations_v1',
  PRODUCTS: 'stocksense_products_v1',
  OPERATIONS: 'stocksense_operations_v1',
  STOCK_MOVES: 'stocksense_stock_moves_v1',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [users, setUsers] = useState<Array<{ loginId: string; email: string; passwordHash: string; fullName: string; role: User['role'] }>>([
    {
      loginId: 'admin123',
      email: 'admin@stocksense.io',
      passwordHash: 'Admin@123', // Demo password
      fullName: 'Alex Morgan',
      role: 'Inventory Manager',
    },
  ]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [operations, setOperations] = useState<Operation[]>(INITIAL_OPERATIONS);
  const [stockMoves, setStockMoves] = useState<StockMove[]>(INITIAL_STOCK_MOVES);
  const [otpStore, setOtpStore] = useState<Record<string, string>>({});

  // Sync Clerk user automatically when signed in via Clerk SSO
  useEffect(() => {
    if (clerkLoaded && clerkSignedIn && clerkUser) {
      const mappedUser: User = {
        id: clerkUser.id,
        loginId: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress.split('@')[0] || 'operator',
        fullName: clerkUser.fullName || clerkUser.firstName || 'Warehouse Operator',
        email: clerkUser.primaryEmailAddress?.emailAddress || 'operator@stocksense.io',
        role: 'Inventory Manager',
        avatar: (clerkUser.firstName?.[0] || 'O').toUpperCase(),
        avatarUrl: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      };
      setUser(mappedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser));
      } catch (err) {
        console.error('Error writing Clerk user to localStorage:', err);
      }
    }
  }, [clerkLoaded, clerkSignedIn, clerkUser]);

  // Check MongoDB connection and hydrate if local is empty
  useEffect(() => {
    fetch('/api/mongodb/data')
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          setIsMongoConnected(true);
          // If local storage is empty, populate from MongoDB!
          if (data.hasData && data.data) {
            const storedProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            if (!storedProd || JSON.parse(storedProd).length === 0) {
              if (data.data.warehouses?.length) setWarehouses(data.data.warehouses);
              if (data.data.locations?.length) setLocations(data.data.locations);
              if (data.data.products?.length) setProducts(data.data.products);
              if (data.data.operations?.length) setOperations(data.data.operations);
              if (data.data.stockMoves?.length) setStockMoves(data.data.stockMoves);
            }
          }
        }
      })
      .catch(() => setIsMongoConnected(false));
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedUsersList = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      const storedWh = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      const storedLoc = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      const storedProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedOps = localStorage.getItem(STORAGE_KEYS.OPERATIONS);
      const storedMoves = localStorage.getItem(STORAGE_KEYS.STOCK_MOVES);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedUsersList) setUsers(JSON.parse(storedUsersList));
      if (storedWh) setWarehouses(JSON.parse(storedWh));
      if (storedLoc) setLocations(JSON.parse(storedLoc));
      if (storedProd) setProducts(JSON.parse(storedProd));
      if (storedOps) setOperations(JSON.parse(storedOps));
      if (storedMoves) setStockMoves(JSON.parse(storedMoves));
    } catch (e) {
      console.error('Error hydrating localStorage:', e);
    }
    setMounted(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(operations));
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVES, JSON.stringify(stockMoves));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [user, users, warehouses, locations, products, operations, stockMoves, mounted]);

  // Recalculate Free to Use inventory balances
  const recomputeStockBalances = () => {
    // 1. Calculate reserved quantities in Ready Deliveries
    const reservedMap: Record<string, number> = {};
    operations
      .filter((op) => op.operationType === 'DELIVERY' && op.status === 'Ready')
      .forEach((op) => {
        op.items.forEach((item) => {
          reservedMap[item.productId] = (reservedMap[item.productId] || 0) + item.quantityDemanded;
        });
      });

    setProducts((prev) =>
      prev.map((p) => {
        const reserved = reservedMap[p.id] || 0;
        return {
          ...p,
          freeToUse: Math.max(0, p.onHand - reserved),
        };
      })
    );
  };

  // Auth functions
  const login = (loginId: string, password: string) => {
    const cleanId = loginId.trim().toLowerCase();
    const found = users.find((u) => u.loginId.toLowerCase() === cleanId && u.passwordHash === password);
    if (!found) {
      return { success: false, error: 'Invalid Login Id or Password' };
    }
    const authedUser: User = {
      id: `usr-${found.loginId}`,
      loginId: found.loginId,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
      avatar: found.fullName.charAt(0).toUpperCase() || 'A',
      createdAt: new Date().toISOString(),
    };
    setUser(authedUser);
    return { success: true };
  };

  const signup = ({ loginId, email, password, fullName }: { loginId: string; email: string; password: string; fullName?: string }) => {
    const cleanId = loginId.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Login ID validation: 6-12 chars
    if (cleanId.length < 6 || cleanId.length > 12) {
      return { success: false, error: 'Login ID must be between 6 and 12 characters.' };
    }

    // 2. Login ID uniqueness
    if (users.some((u) => u.loginId.toLowerCase() === cleanId.toLowerCase())) {
      return { success: false, error: 'Login ID already exists. Please choose a unique ID.' };
    }

    // 3. Email uniqueness & format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email ID already registered. Please sign in or use another email.' };
    }

    // 4. Password validation: >8 chars, lowercase, uppercase, special char
    if (password.length <= 8) {
      return { success: false, error: 'Password length must be more than 8 characters.' };
    }
    if (!/[a-z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { success: false, error: 'Password must contain at least one special character.' };
    }

    const newUserRecord = {
      loginId: cleanId,
      email: cleanEmail,
      passwordHash: password,
      fullName: fullName || cleanId,
      role: 'Inventory Manager' as const,
    };

    setUsers((prev) => [...prev, newUserRecord]);

    const authedUser: User = {
      id: `usr-${cleanId}`,
      loginId: cleanId,
      email: cleanEmail,
      fullName: fullName || cleanId,
      role: 'Inventory Manager',
      avatar: (fullName || cleanId).charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    setUser(authedUser);
    return { success: true };
  };

  const requestOtp = (identifier: string) => {
    const clean = identifier.trim().toLowerCase();
    const userExists = users.find((u) => u.email.toLowerCase() === clean || u.loginId.toLowerCase() === clean);
    if (!userExists) {
      return { success: false, error: 'No account found with this Login ID or Email.' };
    }
    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpStore((prev) => ({ ...prev, [userExists.email]: otp, [userExists.loginId]: otp }));
    return { success: true, otp };
  };

  const resetPasswordWithOtp = (identifier: string, otp: string, newPassword: string) => {
    const clean = identifier.trim().toLowerCase();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === clean || u.loginId.toLowerCase() === clean);
    if (userIndex === -1) {
      return { success: false, error: 'User not found.' };
    }

    const matchedUser = users[userIndex];
    const expectedOtp = otpStore[matchedUser.email] || otpStore[matchedUser.loginId];

    if (!expectedOtp || expectedOtp !== otp.trim()) {
      return { success: false, error: 'Invalid or expired OTP code. Please try again.' };
    }

    // Validate new password rules
    if (newPassword.length <= 8) {
      return { success: false, error: 'Password length must be more than 8 characters.' };
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return { success: false, error: 'Password must contain lowercase, uppercase, and special characters.' };
    }

    // Update password
    setUsers((prev) => {
      const updated = [...prev];
      updated[userIndex] = { ...updated[userIndex], passwordHash: newPassword };
      return updated;
    });

    // Clear used OTP
    setOtpStore((prev) => {
      const copy = { ...prev };
      delete copy[matchedUser.email];
      delete copy[matchedUser.loginId];
      return copy;
    });

    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  // Master Data CRUD
  const addWarehouse = (whData: Omit<Warehouse, 'id' | 'createdAt'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWarehouses((prev) => [...prev, newWh]);
    return newWh;
  };

  const updateWarehouse = (id: string, whData: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...whData } : w)));
  };

  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc-${Date.now()}`,
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  };

  const updateLocation = (id: string, locData: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...locData } : l)));
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'freeToUse' | 'createdAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      freeToUse: prodData.onHand,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProd]);
    return newProd;
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...prodData } : p)));
  };

  // Quick physical stock adjustment
  const quickAdjustStock = (productId: string, locationCode: string, countedQty: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const currentLocQty = prod.locationStocks[locationCode] || 0;
    const diff = countedQty - currentLocQty;
    const newTotalOnHand = Math.max(0, prod.onHand + diff);

    // 1. Update product balances
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newLocStocks = { ...p.locationStocks, [locationCode]: countedQty };
        return {
          ...p,
          onHand: newTotalOnHand,
          freeToUse: Math.max(0, p.freeToUse + diff),
          locationStocks: newLocStocks,
        };
      })
    );

    // 2. Log in Stock Move history
    const adjMove: StockMove = {
      id: `mv-adj-${Date.now()}`,
      reference: `WH/ADJ/${Math.floor(1000 + Math.random() * 9000)}`,
      operationType: 'ADJUSTMENT',
      moveDate: new Date().toISOString().split('T')[0],
      contactName: user?.fullName || 'Inventory Manager',
      productId: prod.id,
      sku: prod.sku,
      productName: prod.name,
      fromLocation: diff < 0 ? locationCode : 'Inventory Reconciliation',
      toLocation: diff < 0 ? 'Inventory Loss / Scrap' : locationCode,
      quantity: Math.abs(diff),
      uom: prod.uom,
      unitCost: prod.perUnitCost,
      status: 'Done',
      moveDirection: 'ADJUSTMENT',
      notes: reason || 'Physical count adjustment',
    };
    setStockMoves((prev) => [adjMove, ...prev]);
  };

  // Operations: Auto-increment sequence generator (<Warehouse>/<Operation>/<ID>)
  const generateReference = (whCode: string, opType: OperationType): string => {
    let opCode = 'IN';
    if (opType === 'DELIVERY') opCode = 'OUT';
    else if (opType === 'INTERNAL') opCode = 'INT';
    else if (opType === 'ADJUSTMENT') opCode = 'ADJ';

    // Count existing operations with this prefix
    const prefix = `${whCode}/${opCode}/`;
    const count = operations.filter((op) => op.reference.startsWith(prefix)).length + 1;
    return `${prefix}${count.toString().padStart(4, '0')}`;
  };

  const createOperation = ({
    operationType,
    warehouseId,
    sourceLocationId,
    destinationLocationId,
    contactName,
    deliveryAddress,
    scheduledDate,
    items,
    notes,
  }: {
    operationType: OperationType;
    warehouseId: string;
    sourceLocationId: string;
    destinationLocationId: string;
    contactName: string;
    deliveryAddress?: string;
    scheduledDate: string;
    items: Array<{ productId: string; quantity: number }>;
    notes?: string;
  }) => {
    const wh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
    const srcLoc = locations.find((l) => l.id === sourceLocationId) || locations[0];
    const destLoc = locations.find((l) => l.id === destinationLocationId) || locations[1];

    const ref = generateReference(wh.shortCode, operationType);

    // Build operation items and check stock availability
    let isAnyItemOutOfStock = false;
    const opItems = items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const isOOS = operationType === 'DELIVERY' && prod && item.quantity > prod.freeToUse;
      if (isOOS) isAnyItemOutOfStock = true;
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: item.productId,
        sku: prod?.sku || 'UNKNOWN',
        name: prod?.name || 'Product',
        uom: prod?.uom || 'Units',
        quantityDemanded: item.quantity,
        quantityDone: item.quantity,
        unitPrice: prod?.perUnitCost || 0,
        isOutOfStock: isOOS,
      };
    });

    // Default status: Draft. If delivery and out of stock, flagged for Waiting
    const initialStatus: OperationStatus = operationType === 'DELIVERY' && isAnyItemOutOfStock ? 'Waiting' : 'Draft';

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      reference: ref,
      operationType,
      warehouseId: wh.id,
      warehouseCode: wh.shortCode,
      sourceLocationId: srcLoc.id,
      sourceLocationCode: srcLoc.shortCode,
      destinationLocationId: destLoc.id,
      destinationLocationCode: destLoc.shortCode,
      contactName,
      deliveryAddress,
      scheduledDate,
      responsible: user?.fullName || 'Alex Morgan',
      status: initialStatus,
      items: opItems,
      notes,
      createdAt: new Date().toISOString(),
    };

    setOperations((prev) => [newOp, ...prev]);
    return newOp;
  };

  const updateOperation = (id: string, data: Partial<Operation>) => {
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, ...data } : op)));
  };

  const deleteOperation = (id: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== id));
  };

  // State Machine Transition
  const transitionOperationStatus = (id: string, nextStatus: OperationStatus) => {
    const op = operations.find((o) => o.id === id);
    if (!op) return { success: false, message: 'Operation not found' };

    // 1. If moving Delivery to Ready: Check stock!
    if (op.operationType === 'DELIVERY' && nextStatus === 'Ready') {
      let hasInsufficientStock = false;
      const updatedItems = op.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const free = prod ? prod.freeToUse : 0;
        const oos = item.quantityDemanded > free;
        if (oos) hasInsufficientStock = true;
        return { ...item, isOutOfStock: oos };
      });

      if (hasInsufficientStock) {
        // Fall into Waiting state with red alert!
        setOperations((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: 'Waiting', items: updatedItems } : o))
        );
        return {
          success: false,
          message: 'Insufficient stock! Items marked in red. Order status moved to Waiting.',
        };
      }
    }

    // 2. If moving to DONE (Validate): Apply stock changes atomically & write to Ledger!
    if (nextStatus === 'Done') {
      const nowStr = new Date().toISOString().split('T')[0];
      const newMoves: StockMove[] = [];

      // Update product inventory balances
      setProducts((prev) => {
        const updated = [...prev];
        op.items.forEach((item) => {
          const idx = updated.findIndex((p) => p.id === item.productId);
          if (idx !== -1) {
            const p = updated[idx];
            const locStocks = { ...p.locationStocks };

            if (op.operationType === 'RECEIPT') {
              // Stock increases in destination location
              const currentLoc = locStocks[op.destinationLocationCode] || 0;
              locStocks[op.destinationLocationCode] = currentLoc + item.quantityDone;
              updated[idx] = {
                ...p,
                onHand: p.onHand + item.quantityDone,
                freeToUse: p.freeToUse + item.quantityDone,
                locationStocks: locStocks,
              };

              newMoves.push({
                id: `mv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                operationId: op.id,
                reference: op.reference,
                operationType: 'RECEIPT',
                moveDate: nowStr,
                contactName: op.contactName,
                productId: p.id,
                sku: p.sku,
                productName: p.name,
                fromLocation: op.sourceLocationCode,
                toLocation: op.destinationLocationCode,
                quantity: item.quantityDone,
                uom: p.uom,
                unitCost: p.perUnitCost,
                status: 'Done',
                moveDirection: 'IN', // Green
              });
            } else if (op.operationType === 'DELIVERY') {
              // Stock decreases from source location
              const currentLoc = locStocks[op.sourceLocationCode] || 0;
              locStocks[op.sourceLocationCode] = Math.max(0, currentLoc - item.quantityDone);
              updated[idx] = {
                ...p,
                onHand: Math.max(0, p.onHand - item.quantityDone),
                freeToUse: Math.max(0, p.freeToUse - item.quantityDone),
                locationStocks: locStocks,
              };

              newMoves.push({
                id: `mv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                operationId: op.id,
                reference: op.reference,
                operationType: 'DELIVERY',
                moveDate: nowStr,
                contactName: op.contactName,
                productId: p.id,
                sku: p.sku,
                productName: p.name,
                fromLocation: op.sourceLocationCode,
                toLocation: op.destinationLocationCode,
                quantity: item.quantityDone,
                uom: p.uom,
                unitCost: p.perUnitCost,
                status: 'Done',
                moveDirection: 'OUT', // Red
              });
            } else if (op.operationType === 'INTERNAL') {
              // Move between locations; total onHand stays constant
              const srcQty = locStocks[op.sourceLocationCode] || 0;
              const destQty = locStocks[op.destinationLocationCode] || 0;
              locStocks[op.sourceLocationCode] = Math.max(0, srcQty - item.quantityDone);
              locStocks[op.destinationLocationCode] = destQty + item.quantityDone;
              updated[idx] = {
                ...p,
                locationStocks: locStocks,
              };

              newMoves.push({
                id: `mv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                operationId: op.id,
                reference: op.reference,
                operationType: 'INTERNAL',
                moveDate: nowStr,
                contactName: op.contactName,
                productId: p.id,
                sku: p.sku,
                productName: p.name,
                fromLocation: op.sourceLocationCode,
                toLocation: op.destinationLocationCode,
                quantity: item.quantityDone,
                uom: p.uom,
                unitCost: p.perUnitCost,
                status: 'Done',
                moveDirection: 'INTERNAL',
              });
            }
          }
        });
        return updated;
      });

      // Append new ledger moves to Stock Ledger
      setStockMoves((prev) => [...newMoves, ...prev]);

      // Set operation status to Done
      setOperations((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: 'Done', validatedAt: new Date().toISOString() } : o
        )
      );

      return { success: true, message: `${op.reference} successfully validated and recorded in Stock Ledger!` };
    }

    // Standard transition (Draft -> Ready or Cancelled)
    setOperations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );
    return { success: true };
  };

  // Dashboard Statistics
  const getDashboardStats = (): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];

    const totalProductsCount = products.length;
    const totalInventoryUnits = products.reduce((acc, p) => acc + p.onHand, 0);
    const lowStockItemsCount = products.filter((p) => p.freeToUse <= p.minReorderThreshold).length;

    // Receipts stats
    const openReceipts = operations.filter(
      (op) => op.operationType === 'RECEIPT' && op.status !== 'Done' && op.status !== 'Cancelled'
    );
    const pendingReceiptsCount = openReceipts.length;
    const receiptsLateCount = openReceipts.filter((op) => op.scheduledDate < today).length;
    const receiptsOperationsCount = openReceipts.filter((op) => op.scheduledDate >= today).length;

    // Deliveries stats
    const openDeliveries = operations.filter(
      (op) => op.operationType === 'DELIVERY' && op.status !== 'Done' && op.status !== 'Cancelled'
    );
    const pendingDeliveriesCount = openDeliveries.length;
    const deliveriesLateCount = openDeliveries.filter((op) => op.scheduledDate < today).length;
    const deliveriesWaitingCount = openDeliveries.filter((op) => op.status === 'Waiting').length;
    const deliveriesOperationsCount = openDeliveries.filter((op) => op.scheduledDate >= today).length;

    // Internal transfers scheduled
    const internalTransfersCount = operations.filter(
      (op) => op.operationType === 'INTERNAL' && op.status !== 'Done' && op.status !== 'Cancelled'
    ).length;

    return {
      totalProductsCount,
      totalInventoryUnits,
      lowStockItemsCount,
      pendingReceiptsCount,
      receiptsLateCount,
      receiptsOperationsCount,
      pendingDeliveriesCount,
      deliveriesLateCount,
      deliveriesWaitingCount,
      deliveriesOperationsCount,
      internalTransfersCount,
    };
  };

  // Load / Seed Demo Data from MongoDB Atlas or local initialData
  const loadDemoData = async (source: 'local' | 'mongodb' = 'mongodb'): Promise<{ success: boolean; message: string }> => {
    try {
      if (source === 'mongodb') {
        const res = await fetch('/api/mongodb/seed', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          setWarehouses(INITIAL_WAREHOUSES);
          setLocations(INITIAL_LOCATIONS);
          setProducts(INITIAL_PRODUCTS);
          setOperations(INITIAL_OPERATIONS);
          setStockMoves(INITIAL_STOCK_MOVES);
          setIsMongoConnected(true);
          return { success: true, message: 'Successfully seeded & loaded fresh demo inventory into MongoDB Atlas!' };
        }
      }
      setWarehouses(INITIAL_WAREHOUSES);
      setLocations(INITIAL_LOCATIONS);
      setProducts(INITIAL_PRODUCTS);
      setOperations(INITIAL_OPERATIONS);
      setStockMoves(INITIAL_STOCK_MOVES);
      return { success: true, message: 'Loaded local demo warehouse dataset.' };
    } catch {
      setWarehouses(INITIAL_WAREHOUSES);
      setLocations(INITIAL_LOCATIONS);
      setProducts(INITIAL_PRODUCTS);
      setOperations(INITIAL_OPERATIONS);
      setStockMoves(INITIAL_STOCK_MOVES);
      return { success: true, message: 'Loaded local demo warehouse dataset.' };
    }
  };

  const syncToMongoDB = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/mongodb/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouses, locations, products, operations, stockMoves }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMongoConnected(true);
        return { success: true, message: 'Live inventory synchronized to MongoDB Atlas!' };
      }
      return { success: false, message: data.message || 'Failed to sync to MongoDB' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error syncing to MongoDB' };
    }
  };

  const resetAllData = () => {
    setUser(INITIAL_USER);
    setWarehouses(INITIAL_WAREHOUSES);
    setLocations(INITIAL_LOCATIONS);
    setProducts(INITIAL_PRODUCTS);
    setOperations(INITIAL_OPERATIONS);
    setStockMoves(INITIAL_STOCK_MOVES);
    localStorage.clear();
  };

  return (
    <InventoryContext.Provider
      value={{
        user,
        users,
        warehouses,
        locations,
        products,
        operations,
        stockMoves,
        otpStore,
        isMongoConnected,
        login,
        signup,
        requestOtp,
        resetPasswordWithOtp,
        logout,
        loadDemoData,
        syncToMongoDB,
        addWarehouse,
        updateWarehouse,
        addLocation,
        updateLocation,
        addProduct,
        updateProduct,
        quickAdjustStock,
        createOperation,
        updateOperation,
        transitionOperationStatus,
        deleteOperation,
        recomputeStockBalances,
        getDashboardStats,
        resetAllData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    return {
      user: null,
      users: [],
      warehouses: [],
      locations: [],
      products: [],
      operations: [],
      stockMoves: [],
      otpStore: {},
      isMongoConnected: false,
      login: () => ({ success: false }),
      signup: () => ({ success: false }),
      requestOtp: () => ({ success: false }),
      resetPasswordWithOtp: () => ({ success: false }),
      logout: () => {},
      loadDemoData: async () => ({ success: false, message: '' }),
      syncToMongoDB: async () => ({ success: false, message: '' }),
      addWarehouse: () => ({} as any),
      updateWarehouse: () => {},
      addLocation: () => ({} as any),
      updateLocation: () => {},
      addProduct: () => ({} as any),
      updateProduct: () => {},
      quickAdjustStock: () => {},
      createOperation: () => ({} as any),
      updateOperation: () => {},
      transitionOperationStatus: () => ({ success: false }),
      deleteOperation: () => {},
      recomputeStockBalances: () => {},
      getDashboardStats: () => ({
        totalProductsCount: 0,
        totalInventoryUnits: 0,
        lowStockItemsCount: 0,
        pendingReceiptsCount: 0,
        receiptsLateCount: 0,
        receiptsOperationsCount: 0,
        pendingDeliveriesCount: 0,
        deliveriesLateCount: 0,
        deliveriesWaitingCount: 0,
        deliveriesOperationsCount: 0,
        internalTransfersCount: 0,
      }),
      resetAllData: () => {},
    } as unknown as InventoryContextType;
  }
  return context;
};
