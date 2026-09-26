const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const productsRoutes = require("./routes/products");
const warehousesRoutes = require("./routes/warehouses");
const locationsRoutes = require("./routes/locations");
const stockRoutes = require("./routes/stock");
const receiptsRoutes = require("./routes/receipts");
const deliveriesRoutes = require("./routes/deliveries");
const transfersRoutes = require("./routes/transfers");
const adjustmentsRoutes = require("./routes/adjustments");
const dashboardRoutes = require("./routes/dashboard");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/products", productsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/adjustments", adjustmentsRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/deliveries", deliveriesRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/warehouses", warehousesRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/receipts", receiptsRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "StockSense Backend is running 🚀",
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "PostgreSQL connected successfully! 🚀",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StockSense backend running on http://localhost:${PORT}`);
});