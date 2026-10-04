import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        })
    } catch(err) {
        console.error("Failed to start server:", err);
    }
}

startServer();