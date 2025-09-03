import express from "express";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(express.json());

// Routes
app.use("/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
});

export default app;