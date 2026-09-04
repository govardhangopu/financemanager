import { connectDB } from "../../config/db.js";

export const fetchMonthlyNetFlow = async (userid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `
        SELECT
            DATE_FORMAT(t.date, '%Y-%m') AS month,
            SUM(
                CASE
                    WHEN c.type = 'income' THEN t.amount
                    WHEN c.type = 'expense' THEN -t.amount
                    ELSE 0
                END
            ) AS net_flow
        FROM transactions t
        LEFT JOIN categories c
            ON t.categoryid = c.categoryid
        WHERE t.userid = ?
        GROUP BY DATE_FORMAT(t.date, '%Y-%m')
        ORDER BY month ASC
        `,
        [userid]
    );

    return rows;
};