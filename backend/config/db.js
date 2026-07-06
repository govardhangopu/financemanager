import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

export const connectDB = () => {
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
    }
    return pool;
};