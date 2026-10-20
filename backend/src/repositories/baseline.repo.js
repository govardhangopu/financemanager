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
          AND t.date < DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND t.date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(t.date, '%Y-%m')
        ORDER BY month ASC
        `,
        [userid]
    );

    return rows;
};

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
          AND t.date < CURDATE()
        `,
        [userid]
    );

    return Number(rows[0].cumulative_net_flow);
};

export const fetchScheduledTransactions = async (userid) => {
    const pool = connectDB();
    const [rows] = await pool.query(
        `
        SELECT
            t.transactionid,
            t.amount,
            DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
            t.categoryid,
            c.name AS category_name,
            c.type AS category_type,
            CASE
                WHEN c.type = 'income' THEN t.amount
                WHEN c.type = 'expense' THEN -t.amount
                ELSE 0
            END AS net_flow
        FROM transactions t
        LEFT JOIN categories c ON t.categoryid = c.categoryid
        WHERE t.userid = ? AND t.date >= CURDATE()
        ORDER BY t.date ASC, t.transactionid ASC
        `,
        [userid]
    );
    return rows.map((row) => ({
        ...row,
        amount: Number(row.amount),
        netFlow: Number(row.net_flow)
    }));
};
