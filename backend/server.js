import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on on port http://localhost:${PORT}`);
        })
    } catch(err) {
        console.error("Failed to start server:", err);
    }
}

startServer();