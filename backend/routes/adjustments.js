const express = require("express");
const pool = require("../db");

const router = express.Router();


// GET all adjustments
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        a.id,
        a.adjustment_number,
        a.product_id,
        p.name AS product_name,
        p.sku,
        a.location_id,
        l.name AS location_name,
        a.recorded_quantity,
        a.counted_quantity,
        a.difference,
        a.reason,
        a.status,
        a.created_at,
        a.validated_at
      FROM adjustments a
      JOIN products p
        ON a.product_id = p.id
      JOIN locations l
        ON a.location_id = l.id
      ORDER BY a.id DESC
    `);

        res.json(result.rows);

    } catch (error) {
        console.error("ERROR FETCHING ADJUSTMENTS:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch adjustments",
        });
    }
});


// CREATE adjustment
router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            product_id,
            location_id,
            counted_quantity,
            reason,
        } = req.body;

        if (
            !product_id ||
            !location_id ||
            counted_quantity === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "product_id, location_id and counted_quantity are required",
            });
        }

        if (Number(counted_quantity) < 0) {
            return res.status(400).json({
                success: false,
                message: "counted_quantity cannot be negative",
            });
        }

        await client.query("BEGIN");

        // Get current stock
        const stockResult = await client.query(
            `
      SELECT quantity
      FROM stock
      WHERE product_id = $1
        AND location_id = $2
      FOR UPDATE
      `,
            [product_id, location_id]
        );

        if (stockResult.rows.length === 0) {
            throw new Error("Stock record not found");
        }

        const recordedQuantity =
            Number(stockResult.rows[0].quantity);

        const countedQuantity =
            Number(counted_quantity);

        const difference =
            countedQuantity - recordedQuantity;

        const adjustmentNumber =
            `ADJ-${Date.now()}`;

        // Create adjustment
        const adjustmentResult = await client.query(
            `
  INSERT INTO adjustments
    (
      adjustment_number,
      product_id,
      location_id,
      recorded_quantity,
      counted_quantity,
      reason,
      status
    )
  VALUES
    ($1, $2, $3, $4, $5, $6, 'Draft')
  RETURNING *
  `,
            [
                adjustmentNumber,
                product_id,
                location_id,
                recordedQuantity,
                countedQuantity,
                reason || null,
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Adjustment created successfully",
            adjustment: adjustmentResult.rows[0],
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR CREATING ADJUSTMENT:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create adjustment",
            error: error.message,
        });

    } finally {
        client.release();
    }
});


// VALIDATE adjustment
router.post("/:id/validate", async (req, res) => {
    const client = await pool.connect();

    try {
        const adjustmentId = req.params.id;

        await client.query("BEGIN");

        // Get adjustment
        const adjustmentResult = await client.query(
            `
      SELECT
        id,
        product_id,
        location_id,
        recorded_quantity,
        counted_quantity,
        difference,
        status
      FROM adjustments
      WHERE id = $1
      FOR UPDATE
      `,
            [adjustmentId]
        );

        if (adjustmentResult.rows.length === 0) {
            throw new Error("Adjustment not found");
        }

        const adjustment =
            adjustmentResult.rows[0];

        if (adjustment.status === "Done") {
            throw new Error("Adjustment is already validated");
        }

        const countedQuantity =
            Number(adjustment.counted_quantity);

        const recordedQuantity =
            Number(adjustment.recorded_quantity);

        const difference =
            countedQuantity - recordedQuantity;

        // Lock current stock
        const stockResult = await client.query(
            `
      SELECT quantity
      FROM stock
      WHERE product_id = $1
        AND location_id = $2
      FOR UPDATE
      `,
            [
                adjustment.product_id,
                adjustment.location_id,
            ]
        );

        if (stockResult.rows.length === 0) {
            throw new Error("Stock record not found");
        }

        const currentStock =
            Number(stockResult.rows[0].quantity);

        // Set stock to counted quantity
        await client.query(
            `
      UPDATE stock
      SET quantity = $1,
          updated_at = NOW()
      WHERE product_id = $2
        AND location_id = $3
      `,
            [
                countedQuantity,
                adjustment.product_id,
                adjustment.location_id,
            ]
        );

        // Record adjustment movement
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
          'ADJUSTMENT',
          $2,
          $3,
          NULL,
          'ADJUSTMENT',
          $4
        )
      `,
            [
                adjustment.product_id,
                Math.abs(difference),
                adjustment.location_id,
                adjustment.id,
            ]
        );

        // Mark adjustment as Done
        await client.query(
            `
      UPDATE adjustments
      SET status = 'Done',
          validated_at = NOW()
      WHERE id = $1
      `,
            [adjustmentId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Adjustment validated successfully",
            adjustment_id: adjustmentId,
            previous_stock: currentStock,
            counted_quantity: countedQuantity,
            difference: difference,
            new_stock: countedQuantity,
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "ERROR VALIDATING ADJUSTMENT:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to validate adjustment",
            error: error.message,
        });

    } finally {
        client.release();
    }
});


module.exports = router;