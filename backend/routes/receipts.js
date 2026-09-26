const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all receipts
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        r.id,
        r.receipt_number,
        r.supplier_name,
        r.location_id,
        l.name AS location_name,
        r.status,
        r.created_by,
        r.created_at,
        r.validated_at
      FROM receipts r
      JOIN locations l
        ON r.location_id = l.id
      ORDER BY r.id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching receipts:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch receipts",
        });
    }
});

// GET single receipt with items
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const receipt = await pool.query(
            `
      SELECT
        r.id,
        r.receipt_number,
        r.supplier_name,
        r.location_id,
        l.name AS location_name,
        r.status,
        r.created_by,
        r.created_at,
        r.validated_at
      FROM receipts r
      JOIN locations l
        ON r.location_id = l.id
      WHERE r.id = $1
      `,
            [id]
        );

        if (receipt.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found",
            });
        }

        const items = await pool.query(
            `
      SELECT
        ri.id,
        ri.receipt_id,
        ri.product_id,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        ri.quantity
      FROM receipt_items ri
      JOIN products p
        ON ri.product_id = p.id
      WHERE ri.receipt_id = $1
      ORDER BY ri.id
      `,
            [id]
        );

        res.json({
            ...receipt.rows[0],
            items: items.rows,
        });
    } catch (error) {
        console.error("Error fetching receipt:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch receipt",
        });
    }
});

// CREATE receipt
router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            supplier_name,
            location_id,
            product_id,
            quantity,
            created_by = null,
        } = req.body;

        if (!supplier_name || !location_id || !product_id || !quantity) {
            return res.status(400).json({
                success: false,
                message:
                    "supplier_name, location_id, product_id and quantity are required",
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        // Check location
        const location = await client.query(
            "SELECT id FROM locations WHERE id = $1",
            [location_id]
        );

        if (location.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }

        // Check product
        const product = await client.query(
            "SELECT id FROM products WHERE id = $1",
            [product_id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        await client.query("BEGIN");

        const receiptNumber = `REC-${Date.now()}`;

        const receipt = await client.query(
            `
      INSERT INTO receipts
        (receipt_number, supplier_name, location_id, status, created_by)
      VALUES
        ($1, $2, $3, 'Draft', $4)
      RETURNING *
      `,
            [receiptNumber, supplier_name, location_id, created_by]
        );

        await client.query(
            `
      INSERT INTO receipt_items
        (receipt_id, product_id, quantity)
      VALUES
        ($1, $2, $3)
      `,
            [receipt.rows[0].id, product_id, quantity]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Receipt created successfully",
            receipt: receipt.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR CREATING RECEIPT:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create receipt",
        });
    } finally {
        client.release();
    }
});

// VALIDATE receipt → increase stock + create movement
router.post("/:id/validate", async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        // Get receipt
        const receiptResult = await client.query(
            `
      SELECT *
      FROM receipts
      WHERE id = $1
      FOR UPDATE
      `,
            [id]
        );

        if (receiptResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Receipt not found",
            });
        }

        const receipt = receiptResult.rows[0];

        if (receipt.status === "Done") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Receipt is already validated",
            });
        }

        // Get receipt items
        const itemsResult = await client.query(
            `
      SELECT *
      FROM receipt_items
      WHERE receipt_id = $1
      `,
            [id]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Receipt has no items",
            });
        }

        // Process each item
        for (const item of itemsResult.rows) {
            // Increase stock
            await client.query(
                `
        INSERT INTO stock
          (product_id, location_id, quantity)
        VALUES
          ($1, $2, $3)
        ON CONFLICT (product_id, location_id)
        DO UPDATE SET
          quantity = stock.quantity + EXCLUDED.quantity,
          updated_at = CURRENT_TIMESTAMP
        `,
                [item.product_id, receipt.location_id, item.quantity]
            );

            // Create stock movement
            await client.query(
                `
        INSERT INTO stock_movements
          (
            product_id,
            movement_type,
            quantity,
            source_location_id,
            destination_location_id,
            reference_type,
            reference_id
          )
        VALUES
          (
            $1,
            'RECEIPT',
            $2,
            NULL,
            $3,
            'RECEIPT',
            $4
          )
        `,
                [
                    item.product_id,
                    item.quantity,
                    receipt.location_id,
                    receipt.id,
                ]
            );
        }

        // Mark receipt as done
        const updatedReceipt = await client.query(
            `
      UPDATE receipts
      SET
        status = 'Done',
        validated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
            [id]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Receipt validated successfully",
            receipt: updatedReceipt.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR VALIDATING RECEIPT:", error);

        res.status(500).json({
            success: false,
            message: "Failed to validate receipt",
        });
    } finally {
        client.release();
    }
});

module.exports = router;