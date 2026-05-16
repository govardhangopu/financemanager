import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

export const connectDB = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQLHOST || process.env.DB_HOST,
            user: process.env.MYSQLUSER || process.env.DB_USER,
            password: process.env.MYSQLPASSWORD || process.env.DB_PASS,
            database: process.env.MYSQLDATABASE || process.env.DB_NAME,
            port: Number(process.env.MYSQLPORT) || (process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306),
            waitForConnections: true,
            connectionLimit: 10,
        });
        console.log("✅ MySQL connection pool created");
    }
    return pool;
};