import { connectDB } from "../../config/db.js";

export const createPasswordResetToken = async ({
    userid,
    tokenHash,
    expiresAt
}) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `
        INSERT INTO password_reset_tokens
            (userid, token_hash, expires_at)
        VALUES (?, ?, ?)
        `,
        [userid, tokenHash, expiresAt]
    );

    return result.insertId;
};

export const findPasswordResetToken = async (tokenHash) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT *
        FROM password_reset_tokens
        WHERE token_hash = ?
        LIMIT 1
        `,
        [tokenHash]
    );

    return rows[0] || null;
};

export const markPasswordResetTokenUsed = async (id) => {
    const pool = connectDB();

    await pool.query(
        `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE id = ?
        `,
        [id]
    );
};

export const invalidateUserPasswordResetTokens = async (userid) => {
    const pool = connectDB();

    await pool.query(
        `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE userid = ?
          AND used_at IS NULL
        `,
        [userid]
    );
};