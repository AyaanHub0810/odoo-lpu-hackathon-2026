-- ============================================
-- StockSense Database Schema
-- PostgreSQL 18
-- ============================================

-- ============================================
-- 1. USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'inventory_manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    reorder_level NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. WAREHOUSES
-- ============================================

CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. LOCATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL
        REFERENCES warehouses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (warehouse_id, code)
);

-- ============================================
-- 6. STOCK
-- Current stock of each product at each location
-- ============================================

CREATE TABLE IF NOT EXISTS stock (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL
        REFERENCES products(id) ON DELETE CASCADE,
    location_id INTEGER NOT NULL
        REFERENCES locations(id) ON DELETE CASCADE,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (product_id, location_id)
);

-- ============================================
-- 7. RECEIPTS
-- Incoming stock
-- ============================================

CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(150),
    location_id INTEGER
        REFERENCES locations(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Waiting', 'Ready', 'Done', 'Canceled')),
    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP
);

-- ============================================
-- 8. RECEIPT ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL
        REFERENCES receipts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0)
);

-- ============================================
-- 9. DELIVERIES
-- Outgoing stock
-- ============================================

CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150),
    location_id INTEGER
        REFERENCES locations(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Waiting', 'Ready', 'Done', 'Canceled')),
    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP
);

-- ============================================
-- 10. DELIVERY ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_items (
    id SERIAL PRIMARY KEY,
    delivery_id INTEGER NOT NULL
        REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0)
);

-- ============================================
-- 11. INTERNAL TRANSFERS
-- ============================================

CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    source_location_id INTEGER NOT NULL
        REFERENCES locations(id) ON DELETE RESTRICT,
    destination_location_id INTEGER NOT NULL
        REFERENCES locations(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Waiting', 'Ready', 'Done', 'Canceled')),
    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,

    CHECK (source_location_id <> destination_location_id)
);

-- ============================================
-- 12. TRANSFER ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER NOT NULL
        REFERENCES transfers(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL
        REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0)
);

-- ============================================
-- 13. INVENTORY ADJUSTMENTS
-- Physical count vs recorded stock
-- ============================================

CREATE TABLE IF NOT EXISTS adjustments (
    id SERIAL PRIMARY KEY,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INTEGER NOT NULL
        REFERENCES products(id) ON DELETE RESTRICT,
    location_id INTEGER NOT NULL
        REFERENCES locations(id) ON DELETE RESTRICT,
    recorded_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    counted_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    difference NUMERIC(12,2)
        GENERATED ALWAYS AS (counted_quantity - recorded_quantity) STORED,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Done', 'Canceled')),
    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP
);

-- ============================================
-- 14. STOCK MOVEMENTS / STOCK LEDGER
-- Every stock movement is recorded here
-- ============================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,

    product_id INTEGER NOT NULL
        REFERENCES products(id) ON DELETE RESTRICT,

    movement_type VARCHAR(30) NOT NULL
        CHECK (
            movement_type IN (
                'RECEIPT',
                'DELIVERY',
                'TRANSFER_IN',
                'TRANSFER_OUT',
                'ADJUSTMENT'
            )
        ),

    quantity NUMERIC(12,2) NOT NULL,

    source_location_id INTEGER
        REFERENCES locations(id) ON DELETE SET NULL,

    destination_location_id INTEGER
        REFERENCES locations(id) ON DELETE SET NULL,

    reference_type VARCHAR(30),
    reference_id INTEGER,

    created_by INTEGER
        REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 15. INDEXES
-- Improve common searches
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_sku
ON products(sku);

CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_stock_product
ON stock(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_location
ON stock(location_id);

CREATE INDEX IF NOT EXISTS idx_movements_product
ON stock_movements(product_id);

CREATE INDEX IF NOT EXISTS idx_movements_created_at
ON stock_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_receipts_status
ON receipts(status);

CREATE INDEX IF NOT EXISTS idx_deliveries_status
ON deliveries(status);

CREATE INDEX IF NOT EXISTS idx_transfers_status
ON transfers(status);

-- ============================================
-- END OF STOCKSENSE SCHEMA
-- ============================================