import "dotenv/config";
import app from "./src/app.js";
import { pool, verifyDatabaseConnection } from "./config/db.js";

const PORT = Number(process.env.PORT || 4000);
const startServer = async () => {
    try {
        await verifyDatabaseConnection();
        console.log("Database connection verified");
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exitCode = 1;
        await pool.end();
    };
}

startServer();