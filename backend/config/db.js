import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Create and export the pool instantly (No 'let pool;' at the top!)
export const pool = mysql.createPool({
    host: process.env.MYSQLHOST || "localhost",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "12345678",
    database: process.env.MYSQLDATABASE || "financemanager",
    port: Number(process.env.MYSQLPORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    },
});

console.log("✅ MySQL connection pool created");

// 2. connectDB is a regular function (NOT async) so it returns the pool instantly to your routes
export const connectDB = () => {
    return pool;
};

// 3. Schema initialization runs in the background
async function initializeSchema() {
    try {
        const connection = await pool.getConnection();
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = await fs.readFile(schemaPath, 'utf-8');
        
        const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            await connection.query(statement);
        }
        
        connection.release();
        console.log("✅ Schema initialized successfully");
    } catch (error) {
        console.error("❌ Schema initialization failed:", error);
    }
}

// 4. Trigger the schema build
initializeSchema();