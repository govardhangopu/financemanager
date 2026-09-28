import { connectDB } from "../../config/db.js";

export const fetchCurrentCumulativeNetFlow = async (userid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN c.type = 'income' THEN t.amount
                        WHEN c.type = 'expense' THEN -t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS cumulative_net_flow
        FROM transactions t
        LEFT JOIN categories c
            ON t.categoryid = c.categoryid
        WHERE t.userid = ?
        `,
        [userid]
    );

    return Number(rows[0].cumulative_net_flow);
};

export const fetchGoal = async (userid, goalid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT
            goalid,
            userid,
            name,
            target_amount,
            DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date
        FROM goals
        WHERE goalid = ?
          AND userid = ?
        `,
        [goalid, userid]
    );

    return rows;
};