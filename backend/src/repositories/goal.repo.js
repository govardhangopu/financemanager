import { connectDB } from "../../config/db.js";

export const create = async ({
    userid,
    name,
    target_amount,
    target_date,
    description
}) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `
        INSERT INTO goals (
            userid,
            name,
            target_amount,
            target_date,
            description
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            userid,
            name,
            target_amount,
            target_date,
            description
        ]
    );

    return result.insertId;
};

export const fetchAll = async (userid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT
            goalid,
            userid,
            name,
            target_amount,
            DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date,
            description,
            created_at,
            updated_at
        FROM goals
        WHERE userid = ?
        ORDER BY target_date ASC, goalid ASC
        `,
        [userid]
    );

    return rows;
};

export const fetchById = async (userid, goalid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT
            goalid,
            userid,
            name,
            target_amount,
            DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date,
            description,
            created_at,
            updated_at
        FROM goals
        WHERE goalid = ?
          AND userid = ?
        `,
        [goalid, userid]
    );

    return rows;
};

export const update = async ({
    userid,
    goalid,
    name,
    target_amount,
    target_date,
    description
}) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `
        UPDATE goals
        SET
            name = ?,
            target_amount = ?,
            target_date = ?,
            description = ?
        WHERE goalid = ?
          AND userid = ?
        `,
        [
            name,
            target_amount,
            target_date,
            description,
            goalid,
            userid
        ]
    );

    return result;
};

export const remove = async (userid, goalid) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `
        DELETE FROM goals
        WHERE goalid = ?
          AND userid = ?
        `,
        [goalid, userid]
    );

    return result;
};