import express from "express";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import categoriesRoutes from "./routes/category.routes.js";
import cors from "cors";

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true // if you want cookies/auth headers
}));
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use('/categories', categoriesRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: err.message });
});

export default app;