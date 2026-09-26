const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all locations
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        l.id,
        l.name,
        l.code,
        l.warehouse_id,
        w.name AS warehouse_name,
        w.code AS warehouse_code,
        l.created_at
      FROM locations l
      JOIN warehouses w
        ON l.warehouse_id = w.id
      ORDER BY l.id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching locations:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch locations",
        });
    }
});

// GET locations by warehouse
router.get("/warehouse/:warehouseId", async (req, res) => {
    try {
        const { warehouseId } = req.params;

        const result = await pool.query(
            `
      SELECT
        id,
        name,
        code,
        warehouse_id,
        created_at
      FROM locations
      WHERE warehouse_id = $1
      ORDER BY id
      `,
            [warehouseId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching warehouse locations:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse locations",
        });
    }
});

// GET single location
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
      SELECT
        l.id,
        l.name,
        l.code,
        l.warehouse_id,
        w.name AS warehouse_name,
        w.code AS warehouse_code,
        l.created_at
      FROM locations l
      JOIN warehouses w
        ON l.warehouse_id = w.id
      WHERE l.id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching location:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch location",
        });
    }
});

// CREATE location
router.post("/", async (req, res) => {
    try {
        const { warehouse_id, name, code } = req.body;

        if (!warehouse_id || !name || !code) {
            return res.status(400).json({
                success: false,
                message: "warehouse_id, name and code are required",
            });
        }

        // Verify warehouse exists
        const warehouse = await pool.query(
            "SELECT id FROM warehouses WHERE id = $1",
            [warehouse_id]
        );

        if (warehouse.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found",
            });
        }

        const result = await pool.query(
            `
      INSERT INTO locations
        (warehouse_id, name, code)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
            [warehouse_id, name, code]
        );

        res.status(201).json({
            success: true,
            message: "Location created successfully",
            location: result.rows[0],
        });
    } catch (error) {
        console.error("Error creating location:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Location code already exists in this warehouse",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create location",
        });
    }
});

// UPDATE location
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { warehouse_id, name, code } = req.body;

        const result = await pool.query(
            `
      UPDATE locations
      SET
        warehouse_id = COALESCE($1, warehouse_id),
        name = COALESCE($2, name),
        code = COALESCE($3, code)
      WHERE id = $4
      RETURNING *
      `,
            [warehouse_id, name, code, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        res.json({
            success: true,
            message: "Location updated successfully",
            location: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating location:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Location code already exists in this warehouse",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update location",
        });
    }
});

// DELETE location
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM locations WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        res.json({
            success: true,
            message: "Location deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting location:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete location",
        });
    }
});

module.exports = router;