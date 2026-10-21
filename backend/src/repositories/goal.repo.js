import { connectDB } from "../../config/db.js";

export const create = async ({
    userid,
    name,
    target_amount,
    target_date,
    description
}) => {
    const pool = connectDB();
    const [priorityRows] = await pool.query(
        "SELECT COALESCE(MAX(priority_order), -1) + 1 AS priority_order FROM goals WHERE userid = ?",
        [userid]
    );
    const priorityOrder = Number(priorityRows[0].priority_order);

    const [result] = await pool.query(
        `
        INSERT INTO goals (
            userid,
            name,
            target_amount,
            target_date,
            description,
            priority_order
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            userid,
            name,
            target_amount,
            target_date,
            description,
            priorityOrder
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
            priority_order,
            created_at,
            updated_at
        FROM goals
        WHERE userid = ?
        ORDER BY priority_order ASC, target_date ASC, goalid ASC
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
            priority_order,
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

export const reorder = async (userid, orderedGoalIds) => {
    const pool = connectDB();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [rows] = await connection.query(
            "SELECT goalid FROM goals WHERE userid = ? FOR UPDATE",
            [userid]
        );
        const existingIds = rows.map((row) => Number(row.goalid));
        const requestedIds = orderedGoalIds.map(Number);

        if (
            existingIds.length !== requestedIds.length
            || existingIds.some((id) => !requestedIds.includes(id))
        ) {
            throw new Error("Reorder request must include every goal owned by the user exactly once.");
        }

        for (const [priorityOrder, goalid] of requestedIds.entries()) {
            await connection.query(
                "UPDATE goals SET priority_order = ? WHERE goalid = ? AND userid = ?",
                [priorityOrder, goalid, userid]
            );
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
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
