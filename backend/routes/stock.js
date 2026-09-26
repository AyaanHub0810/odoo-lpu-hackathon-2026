const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all stock
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        s.id,
        s.product_id,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        s.location_id,
        l.name AS location_name,
        l.code AS location_code,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        s.quantity,
        p.reorder_level,
        CASE
          WHEN s.quantity = 0 THEN 'Out of Stock'
          WHEN s.quantity <= p.reorder_level THEN 'Low Stock'
          ELSE 'In Stock'
        END AS stock_status,
        s.updated_at
      FROM stock s
      JOIN products p
        ON s.product_id = p.id
      JOIN locations l
        ON s.location_id = l.id
      JOIN warehouses w
        ON l.warehouse_id = w.id
      ORDER BY s.id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching stock:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stock",
        });
    }
});

// GET stock for a specific product
router.get("/product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await pool.query(
            `
      SELECT
        s.id,
        s.product_id,
        p.name AS product_name,
        p.sku,
        s.location_id,
        l.name AS location_name,
        l.code AS location_code,
        w.name AS warehouse_name,
        s.quantity,
        p.reorder_level,
        CASE
          WHEN s.quantity = 0 THEN 'Out of Stock'
          WHEN s.quantity <= p.reorder_level THEN 'Low Stock'
          ELSE 'In Stock'
        END AS stock_status
      FROM stock s
      JOIN products p
        ON s.product_id = p.id
      JOIN locations l
        ON s.location_id = l.id
      JOIN warehouses w
        ON l.warehouse_id = w.id
      WHERE s.product_id = $1
      ORDER BY s.id
      `,
            [productId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching product stock:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product stock",
        });
    }
});

// GET stock at a specific location
router.get("/location/:locationId", async (req, res) => {
    try {
        const { locationId } = req.params;

        const result = await pool.query(
            `
      SELECT
        s.id,
        s.product_id,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        s.location_id,
        l.name AS location_name,
        l.code AS location_code,
        s.quantity,
        p.reorder_level,
        CASE
          WHEN s.quantity = 0 THEN 'Out of Stock'
          WHEN s.quantity <= p.reorder_level THEN 'Low Stock'
          ELSE 'In Stock'
        END AS stock_status
      FROM stock s
      JOIN products p
        ON s.product_id = p.id
      JOIN locations l
        ON s.location_id = l.id
      WHERE s.location_id = $1
      ORDER BY p.name
      `,
            [locationId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching location stock:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch location stock",
        });
    }
});

// INITIALIZE / SET stock for a product at a location
router.post("/", async (req, res) => {
    try {
        const { product_id, location_id, quantity = 0 } = req.body;

        if (!product_id || !location_id) {
            return res.status(400).json({
                success: false,
                message: "product_id and location_id are required",
            });
        }

        if (Number(quantity) < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative",
            });
        }

        // Check product
        const product = await pool.query(
            "SELECT id, name FROM products WHERE id = $1",
            [product_id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check location
        const location = await pool.query(
            "SELECT id, name FROM locations WHERE id = $1",
            [location_id]
        );

        if (location.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        const result = await pool.query(
            `
      INSERT INTO stock
        (product_id, location_id, quantity)
      VALUES
        ($1, $2, $3)
      ON CONFLICT (product_id, location_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
            [product_id, location_id, quantity]
        );

        res.status(201).json({
            success: true,
            message: "Stock updated successfully",
            stock: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating stock:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update stock",
        });
    }
});

module.exports = router;