import { connectDB } from "../../config/db.js";

export const fetchUsers = async () => {
    const pool = connectDB();
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};