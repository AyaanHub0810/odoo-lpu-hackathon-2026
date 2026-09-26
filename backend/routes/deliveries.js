const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all deliveries
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        d.id,
        d.delivery_number,
        d.customer_name,
        d.location_id,
        l.name AS location_name,
        d.status,
        d.created_at,
        d.validated_at
      FROM deliveries d
      JOIN locations l ON d.location_id = l.id
      ORDER BY d.id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching deliveries:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch deliveries",
        });
    }
});


// CREATE delivery
router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            customer_name,
            location_id,
            product_id,
            quantity,
        } = req.body;

        if (!customer_name || !location_id || !product_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: "customer_name, location_id, product_id and quantity are required",
            });
        }

        await client.query("BEGIN");

        const deliveryNumber = `DEL-${Date.now()}`;

        const deliveryResult = await client.query(
            `
      INSERT INTO deliveries
        (delivery_number, customer_name, location_id, status)
      VALUES
        ($1, $2, $3, 'Draft')
      RETURNING *
      `,
            [deliveryNumber, customer_name, location_id]
        );

        const delivery = deliveryResult.rows[0];

        await client.query(
            `
      INSERT INTO delivery_items
        (delivery_id, product_id, quantity)
      VALUES
        ($1, $2, $3)
      `,
            [delivery.id, product_id, quantity]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Delivery created successfully",
            delivery,
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR CREATING DELIVERY:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create delivery",
        });

    } finally {
        client.release();
    }
});


// VALIDATE delivery
router.post("/:id/validate", async (req, res) => {
    const client = await pool.connect();

    try {
        const deliveryId = req.params.id;

        await client.query("BEGIN");

        // Get delivery + item
        const deliveryResult = await client.query(
            `
      SELECT
        d.id,
        d.delivery_number,
        d.location_id,
        d.status,
        di.product_id,
        di.quantity
      FROM deliveries d
      JOIN delivery_items di
        ON d.id = di.delivery_id
      WHERE d.id = $1
      FOR UPDATE
      `,
            [deliveryId]
        );

        if (deliveryResult.rows.length === 0) {
            throw new Error("Delivery not found");
        }

        const delivery = deliveryResult.rows[0];

        if (delivery.status === "Done") {
            throw new Error("Delivery is already validated");
        }

        // Lock stock row
        const stockResult = await client.query(
            `
      SELECT id, quantity
      FROM stock
      WHERE product_id = $1
        AND location_id = $2
      FOR UPDATE
      `,
            [delivery.product_id, delivery.location_id]
        );

        if (stockResult.rows.length === 0) {
            throw new Error("Stock record not found");
        }

        const currentStock = Number(stockResult.rows[0].quantity);
        const deliveryQuantity = Number(delivery.quantity);

        if (currentStock < deliveryQuantity) {
            throw new Error(
                `Insufficient stock. Available: ${currentStock}, requested: ${deliveryQuantity}`
            );
        }

        const newStock = currentStock - deliveryQuantity;

        // Decrease stock
        await client.query(
            `
      UPDATE stock
      SET quantity = $1,
          updated_at = NOW()
      WHERE product_id = $2
        AND location_id = $3
      `,
            [
                newStock,
                delivery.product_id,
                delivery.location_id,
            ]
        );

        // Add stock movement
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
        ($1, 'DELIVERY', $2, $3, NULL, 'DELIVERY', $4)
      `,
            [
                delivery.product_id,
                deliveryQuantity,
                delivery.location_id,
                delivery.id,
            ]
        );

        // Mark delivery as Done
        await client.query(
            `
      UPDATE deliveries
      SET status = 'Done',
          validated_at = NOW()
      WHERE id = $1
      `,
            [deliveryId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Delivery validated successfully",
            delivery_id: deliveryId,
            quantity_delivered: deliveryQuantity,
            previous_stock: currentStock,
            remaining_stock: newStock,
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR VALIDATING DELIVERY:", error);

        res.status(500).json({
            success: false,
            message: "Failed to validate delivery",
            error: error.message,
        });

    } finally {
        client.release();
    }
});


module.exports = router;