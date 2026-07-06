import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let pool;

export const connectDB = async () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQLHOST || "localhost",
            user: process.env.MYSQLUSER || "root",
            password: process.env.MYSQLPASSWORD || "12345678",
            database: process.env.MYSQLDATABASE || "financemanager",
            port: Number(process.env.MYSQLPORT || 3306),
            waitForConnections: true,
            connectionLimit: 10,
            ssl: {
                rejectUnauthorized: false // <-- CRITICAL FOR AIVEN
            },
        });
        console.log("✅ MySQL connection pool created");

        // Execute schema on connection
        await initializeSchema();
    }
    return pool;
};

async function initializeSchema() {
    try {
        const connection = await pool.getConnection();
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = await fs.readFile(schemaPath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            await connection.query(statement);
        }
        
        connection.release();
        console.log("✅ Schema initialized successfully");
    } catch (error) {
        console.error("❌ Schema initialization failed:", error);
        throw error;
    }
}