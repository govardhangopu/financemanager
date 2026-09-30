import { connectDB } from "../../config/db.js";

export const fetchUsers = async () => {
    const pool = connectDB();
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
};

export const findUser = async ({ username }) => {
    const pool = connectDB();
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    return rows;
}

export const createUser = async ({ name, email, username, password }) => {
    const pool = connectDB();
    const [result] = await pool.query(`INSERT INTO users(name, email, username, password) VALUES (?,?,?,?)`, [name, email, username, password]);
    return result;
}

export const findUserById = async (userid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        "SELECT * FROM users WHERE userid = ?",
        [userid]
    );

    return rows[0];
};

export const updatePassword = async (userid, password) => {
    const pool = connectDB();

    await pool.query(
        "UPDATE users SET password = ? WHERE userid = ?",
        [password, userid]
    );
};