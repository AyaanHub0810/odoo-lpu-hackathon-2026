const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all transfers
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        t.id,
        t.transfer_number,
        t.source_location_id,
        sl.name AS source_location_name,
        t.destination_location_id,
        dl.name AS destination_location_name,
        t.status,
        t.created_at,
        t.validated_at
      FROM transfers t
      JOIN locations sl
        ON t.source_location_id = sl.id
      JOIN locations dl
        ON t.destination_location_id = dl.id
      ORDER BY t.id DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("ERROR FETCHING TRANSFERS:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transfers",
        });
    }
});


// CREATE transfer
router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            source_location_id,
            destination_location_id,
            product_id,
            quantity,
        } = req.body;

        if (
            !source_location_id ||
            !destination_location_id ||
            !product_id ||
            !quantity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "source_location_id, destination_location_id, product_id and quantity are required",
            });
        }

        if (source_location_id === destination_location_id) {
            return res.status(400).json({
                success: false,
                message: "Source and destination locations must be different",
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0",
            });
        }

        await client.query("BEGIN");

        const transferNumber = `TRF-${Date.now()}`;

        const transferResult = await client.query(
            `
      INSERT INTO transfers
        (
          transfer_number,
          source_location_id,
          destination_location_id,
          status
        )
      VALUES
        ($1, $2, $3, 'Draft')
      RETURNING *
      `,
            [
                transferNumber,
                source_location_id,
                destination_location_id,
            ]
        );

        const transfer = transferResult.rows[0];

        await client.query(
            `
      INSERT INTO transfer_items
        (
          transfer_id,
          product_id,
          quantity
        )
      VALUES
        ($1, $2, $3)
      `,
            [
                transfer.id,
                product_id,
                quantity,
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Transfer created successfully",
            transfer,
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR CREATING TRANSFER:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create transfer",
            error: error.message,
        });

    } finally {
        client.release();
    }
});


// VALIDATE transfer
router.post("/:id/validate", async (req, res) => {
    const client = await pool.connect();

    try {
        const transferId = req.params.id;

        await client.query("BEGIN");

        // Get transfer + item
        const transferResult = await client.query(
            `
      SELECT
        t.id,
        t.transfer_number,
        t.source_location_id,
        t.destination_location_id,
        t.status,
        ti.product_id,
        ti.quantity
      FROM transfers t
      JOIN transfer_items ti
        ON t.id = ti.transfer_id
      WHERE t.id = $1
      FOR UPDATE
      `,
            [transferId]
        );

        if (transferResult.rows.length === 0) {
            throw new Error("Transfer not found");
        }

        const transfer = transferResult.rows[0];

        if (transfer.status === "Done") {
            throw new Error("Transfer is already validated");
        }

        const sourceLocationId = transfer.source_location_id;
        const destinationLocationId =
            transfer.destination_location_id;

        const productId = transfer.product_id;
        const transferQuantity = Number(transfer.quantity);

        // Get source stock
        const sourceStockResult = await client.query(
            `
      SELECT id, quantity
      FROM stock
      WHERE product_id = $1
        AND location_id = $2
      FOR UPDATE
      `,
            [productId, sourceLocationId]
        );

        if (sourceStockResult.rows.length === 0) {
            throw new Error("Source stock record not found");
        }

        const sourceStock =
            Number(sourceStockResult.rows[0].quantity);

        if (sourceStock < transferQuantity) {
            throw new Error(
                `Insufficient stock. Available: ${sourceStock}, requested: ${transferQuantity}`
            );
        }

        const newSourceStock =
            sourceStock - transferQuantity;

        // Decrease source stock
        await client.query(
            `
      UPDATE stock
      SET quantity = $1,
          updated_at = NOW()
      WHERE product_id = $2
        AND location_id = $3
      `,
            [
                newSourceStock,
                productId,
                sourceLocationId,
            ]
        );

        // Add destination stock
        await client.query(
            `
      INSERT INTO stock
        (
          product_id,
          location_id,
          quantity
        )
      VALUES
        ($1, $2, $3)
      ON CONFLICT (product_id, location_id)
      DO UPDATE SET
        quantity = stock.quantity + EXCLUDED.quantity,
        updated_at = NOW()
      `,
            [
                productId,
                destinationLocationId,
                transferQuantity,
            ]
        );

        // Record TRANSFER_OUT movement
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
      'TRANSFER_OUT',
      $2,
      $3,
      $4,
      'TRANSFER',
      $5
    )
  `,
            [
                productId,
                transferQuantity,
                sourceLocationId,
                destinationLocationId,
                transfer.id,
            ]
        );

        // Record TRANSFER_IN movement
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
      'TRANSFER_IN',
      $2,
      $3,
      $4,
      'TRANSFER',
      $5
    )
  `,
            [
                productId,
                transferQuantity,
                sourceLocationId,
                destinationLocationId,
                transfer.id,
            ]
        );

        // Mark transfer as Done
        await client.query(
            `
      UPDATE transfers
      SET status = 'Done',
          validated_at = NOW()
      WHERE id = $1
      `,
            [transferId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Transfer validated successfully",
            transfer_id: transferId,
            quantity_transferred: transferQuantity,
            source_previous_stock: sourceStock,
            source_remaining_stock: newSourceStock,
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("ERROR VALIDATING TRANSFER:", error);

        res.status(500).json({
            success: false,
            message: "Failed to validate transfer",
            error: error.message,
        });

    } finally {
        client.release();
    }
});


module.exports = router;