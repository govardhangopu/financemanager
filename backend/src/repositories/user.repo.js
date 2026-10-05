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
    return result.insertId;
}

export const createOAuthAccount = async ({ userid, providerUserId, providerEmail }) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `INSERT INTO oauth_accounts
            (userid, provider_user_id, provider_email)
         VALUES (?, ?, ?)`,
        [userid, providerUserId, providerEmail]
    );

    return result.insertId;
};

export const findUserById = async (userid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        "SELECT * FROM users WHERE userid = ?",
        [userid]
    );

    return rows[0];
};

export const findUserByEmail = async (email) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `SELECT userid, name, username, email, password
         FROM users
         WHERE email = ?`,
        [email]
    );

    return rows[0] || null;
};

export const findOAuthAccount = async (providerUserId) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `SELECT userid, provider_user_id, provider_email
         FROM oauth_accounts
         WHERE provider_user_id = ?`,
        [providerUserId]
    );

    return rows[0] || null;
};

export const findOAuthAccountByUserId = async (userid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `SELECT * FROM oauth_accounts WHERE userid = ? LIMIT 1`,
        [userid]
    );

    return rows[0] || null;
};

export const updatePassword = async (userid, password) => {
    const pool = connectDB();

    await pool.query(
        "UPDATE users SET password = ? WHERE userid = ?",
        [password, userid]
    );
};

// UPDATE
export const updateUser = async ({ userid, name, username, email }) => {
    const pool = connectDB();

    await pool.query(
        `UPDATE users
         SET name = ?, username = ?, email = ?
         WHERE userid = ?`,
        [name, username, email, userid]
    );

    return await findUserById(userid);
};

// DELETE
export const deleteUser = async (userid) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `DELETE FROM users WHERE userid = ?`,
        [userid]
    );

    return result;
};

export const unlinkGoogleAccount = async (userid) => {
    const pool = connectDB();

    const [result] = await pool.query(
        "DELETE FROM oauth_accounts WHERE userid = ?",
        [userid]
    );

    return result;
};