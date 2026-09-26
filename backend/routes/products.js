const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.unit_of_measure,
        p.reorder_level,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching products:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
});

// GET single product
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.unit_of_measure,
        p.reorder_level,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching product:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
});

// CREATE product
router.post("/", async (req, res) => {
    try {
        const {
            name,
            sku,
            category_id,
            unit_of_measure,
            reorder_level = 0,
        } = req.body;

        if (!name || !sku || !unit_of_measure) {
            return res.status(400).json({
                success: false,
                message: "Name, SKU and unit_of_measure are required",
            });
        }

        const result = await pool.query(
            `
      INSERT INTO products
        (name, sku, category_id, unit_of_measure, reorder_level)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
            [
                name,
                sku,
                category_id || null,
                unit_of_measure,
                reorder_level,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: result.rows[0],
        });
    } catch (error) {
        console.error("Error creating product:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
});

// UPDATE product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            sku,
            category_id,
            unit_of_measure,
            reorder_level,
        } = req.body;

        const result = await pool.query(
            `
      UPDATE products
      SET
        name = COALESCE($1, name),
        sku = COALESCE($2, sku),
        category_id = $3,
        unit_of_measure = COALESCE($4, unit_of_measure),
        reorder_level = COALESCE($5, reorder_level),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
            [
                name,
                sku,
                category_id || null,
                unit_of_measure,
                reorder_level,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating product:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
});

// DELETE product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting product:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
});

module.exports = router;