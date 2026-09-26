export type OperationType = 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';

export type OperationStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Cancelled';

export interface User {
  id: string;
  loginId: string;
  email: string;
  fullName: string;
  role: 'Inventory Manager' | 'Warehouse Staff' | 'Administrator';
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string; // e.g. "WH"
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  name: string;
  shortCode: string; // e.g. "WH/Stock1"
  type: 'internal' | 'vendor' | 'customer' | 'loss';
  capacity?: number;
  currentFill?: number; // For 2D visual map
  zone?: string;
}

export interface Product {
  id: string;
  sku: string; // e.g. "DESK001"
  name: string; // e.g. "Desk"
  category: string; // e.g. "Furniture", "Raw Materials"
  uom: string; // e.g. "Units", "kg", "boxes"
  perUnitCost: number; // in Rs
  minReorderThreshold: number; // Low stock alert threshold
  targetMaxQuantity: number;
  onHand: number;
  freeToUse: number;
  locationStocks: Record<string, number>; // locationShortCode -> quantity
  description?: string;
  createdAt: string;
}

export interface OperationItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  uom: string;
  quantityDemanded: number;
  quantityDone: number;
  unitPrice: number;
  isOutOfStock?: boolean;
}

export interface Operation {
  id: string;
  reference: string; // e.g. "WH/IN/0001", "WH/OUT/0001", "WH/INT/0001", "WH/ADJ/0001"
  operationType: OperationType;
  warehouseId: string;
  warehouseCode: string;
  sourceLocationId: string;
  sourceLocationCode: string;
  destinationLocationId: string;
  destinationLocationCode: string;
  contactName: string; // Vendor, Customer, or Internal
  deliveryAddress?: string;
  scheduledDate: string; // YYYY-MM-DD
  responsible: string; // User Name
  status: OperationStatus;
  items: OperationItem[];
  notes?: string;
  createdAt: string;
  validatedAt?: string;
  printCount?: number;
}

export interface StockMove {
  id: string;
  operationId?: string;
  reference: string;
  operationType: OperationType;
  moveDate: string;
  contactName: string;
  productId: string;
  sku: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  uom: string;
  unitCost: number;
  status: 'Ready' | 'Done';
  moveDirection: 'IN' | 'OUT' | 'INTERNAL' | 'ADJUSTMENT';
  notes?: string;
}

export interface DashboardStats {
  totalProductsCount: number;
  totalInventoryUnits: number;
  lowStockItemsCount: number;
  pendingReceiptsCount: number;
  receiptsLateCount: number;
  receiptsOperationsCount: number;
  pendingDeliveriesCount: number;
  deliveriesLateCount: number;
  deliveriesWaitingCount: number;
  deliveriesOperationsCount: number;
  internalTransfersCount: number;
}
