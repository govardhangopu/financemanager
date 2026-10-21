import { connectDB } from "../../config/db.js";

export const fetchGoal = async (userid, goalid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT
            goalid,
            userid,
            name,
            target_amount,
            DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date,
            priority_order
        FROM goals
        WHERE goalid = ?
          AND userid = ?
        `,
        [goalid, userid]
    );

    return rows;
};

export const fetchGoalsForAllocation = async (userid) => {
    const pool = connectDB();
    const [rows] = await pool.query(
        `SELECT goalid, target_amount, priority_order,
                DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date
         FROM goals
         WHERE userid = ?
         ORDER BY priority_order ASC, target_date ASC, goalid ASC`,
        [userid]
    );
    return rows;
};
