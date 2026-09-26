const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const stockSummary = await pool.query(`
  SELECT
    COALESCE(SUM(s.quantity), 0) AS total_stock,

    COUNT(*) FILTER (
      WHERE s.quantity > 0
        AND s.quantity <= p.reorder_level
    ) AS low_stock_items,

    COUNT(*) FILTER (
      WHERE s.quantity = 0
    ) AS out_of_stock_items

  FROM stock s
  JOIN products p
    ON s.product_id = p.id
`);

        const pendingReceipts = await pool.query(`
      SELECT COUNT(*) AS count
      FROM receipts
      WHERE status <> 'Done'
    `);

        const pendingDeliveries = await pool.query(`
      SELECT COUNT(*) AS count
      FROM deliveries
      WHERE status <> 'Done'
    `);

        const pendingTransfers = await pool.query(`
      SELECT COUNT(*) AS count
      FROM transfers
      WHERE status <> 'Done'
    `);

        const recentMovements = await pool.query(`
      SELECT
        sm.id,
        sm.product_id,
        p.name AS product_name,
        p.sku,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.created_at
      FROM stock_movements sm
      JOIN products p
        ON sm.product_id = p.id
      ORDER BY sm.id DESC
      LIMIT 10
    `);

        res.json({
            success: true,

            stock: {
                total_stock: Number(stockSummary.rows[0].total_stock),
                low_stock_items: Number(
                    stockSummary.rows[0].low_stock_items
                ),
                out_of_stock_items: Number(
                    stockSummary.rows[0].out_of_stock_items
                ),
            },

            pending: {
                receipts: Number(pendingReceipts.rows[0].count),
                deliveries: Number(pendingDeliveries.rows[0].count),
                transfers: Number(pendingTransfers.rows[0].count),
            },

            recent_movements: recentMovements.rows,
        });

    } catch (error) {
        console.error("ERROR FETCHING DASHBOARD:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard",
            error: error.message,
        });
    }
});

module.exports = router;