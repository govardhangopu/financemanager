import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.MYSQLHOST || "localhost",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS,
    database: process.env.MYSQLDATABASE || "financemanager",
    port: Number(process.env.MYSQLPORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    },
});

export const connectDB = () => {
    return pool;
};

export const verifyDatabaseConnection = async () => {
    await pool.query("SELECT 1");
};