const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all warehouses
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        id,
        name,
        code,
        address,
        created_at
      FROM warehouses
      ORDER BY id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching warehouses:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouses",
        });
    }
});

// GET single warehouse
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
      SELECT
        id,
        name,
        code,
        address,
        created_at
      FROM warehouses
      WHERE id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching warehouse:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse",
        });
    }
});

// CREATE warehouse
router.post("/", async (req, res) => {
    try {
        const { name, code, address } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Name and code are required",
            });
        }

        const result = await pool.query(
            `
      INSERT INTO warehouses
        (name, code, address)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
            [name, code, address || null]
        );

        res.status(201).json({
            success: true,
            message: "Warehouse created successfully",
            warehouse: result.rows[0],
        });
    } catch (error) {
        console.error("Error creating warehouse:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Warehouse code already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create warehouse",
        });
    }
});

// UPDATE warehouse
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, address } = req.body;

        const result = await pool.query(
            `
      UPDATE warehouses
      SET
        name = COALESCE($1, name),
        code = COALESCE($2, code),
        address = COALESCE($3, address)
      WHERE id = $4
      RETURNING *
      `,
            [name, code, address, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found",
            });
        }

        res.json({
            success: true,
            message: "Warehouse updated successfully",
            warehouse: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating warehouse:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Warehouse code already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update warehouse",
        });
    }
});

// DELETE warehouse
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM warehouses WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found",
            });
        }

        res.json({
            success: true,
            message: "Warehouse deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting warehouse:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete warehouse",
        });
    }
});

module.exports = router;