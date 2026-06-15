import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import categoriesRoutes from "./routes/category.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import { connectDB } from "../config/db.js";

const pool = connectDB();

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://financemanager-opal.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use('/categories', categoriesRoutes);
app.use('/budgets', budgetRoutes);

// Health check
app.get("/", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        console.log("Health check successful ✅");
        return res.status(200).json({
            status: "ok",
            database: "connected"
        });
    }
    catch (err) {
        console.error("Database connection error:", err);
        return res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: err.message });
});

export default app;