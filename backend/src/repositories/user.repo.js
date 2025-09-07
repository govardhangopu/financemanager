import { connectDB } from "../../config/db.js";

export const fetchUsers = async () => {
    const pool = connectDB();
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

export const findUser = async ({ username }) => {
    const pool = connectDB();
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", username);
    return rows;
}

export const createUser = async ({ name, email, username, password }) => {
    const pool = connectDB();
    const [result] = await pool.query(`INSERT INTO users(name, email, username, password) VALUES (?,?,?,?)`, [name, email, username, password]);
    return result;
}