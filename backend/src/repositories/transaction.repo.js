import { connectDB } from "../../config/db.js";

export const create = async (userid, amount, categoryid, is_partial, datetime) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO transactions(userid, amount, categoryid, is_partial, date)
        VALUES (?, ?, ?, ?, ?)`, [userid, amount, categoryid, is_partial, datetime]);
    return rows;
}

export const fetchById = async (userid, transactionid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `SELECT t.*, c.name AS category_name, c.type, c.parent_categoryid
         FROM transactions t
         LEFT JOIN categories c ON t.categoryid = c.categoryid
         WHERE t.transactionid = ? AND t.userid = ?`,
        [transactionid, userid]
    );

    return rows;
}

export const fetchTransactions = async (userid, is_partial = null) => {
    const pool = connectDB();
    const values = [userid];

    if (is_partial) values.push(is_partial);

    const [rows] = await pool.query(`
        SELECT t.*, c.name AS category_name, c.type, c.parent_categoryid
        FROM transactions t
        LEFT JOIN categories c
            ON t.categoryid = c.categoryid
        WHERE t.userid = ?
        ${is_partial ? "AND is_partial = ?" : ""}
    `, values);

    return rows;
}

export const fetchMonthlyNetFlowByCategories = async (userid, categoryids) => {
    if (!categoryids || categoryids.length === 0) {
        return [];
    }

    const pool = connectDB();

    const placeholders = categoryids
        .map(() => "?")
        .join(", ");

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
          AND t.categoryid IN (${placeholders})
        GROUP BY DATE_FORMAT(t.date, '%Y-%m')
        ORDER BY month ASC
        `,
        [userid, ...categoryids]
    );

    return rows;
};

export const updateRow = async (userid, transactionid, amount, categoryid, is_partial, date) => {
    const pool = connectDB();
    const fields = [], values = [];

    if (amount) fields.push("amount = ?") && values.push(amount);
    if (categoryid) fields.push("categoryid = ?") && values.push(categoryid);
    if (is_partial) fields.push("is_partial = ?") && values.push(is_partial);
    if (date) fields.push("date = ?") && values.push(date);

    const sql = `
    UPDATE transactions SET 
    ${fields.join(", ")} 
    WHERE transactionid = ? 
    AND userid = ?
    `;

    values.push(transactionid, userid);

    const [rows] = await pool.query(sql, values);
    return rows;
}

export const deleteRow = async (userid, transactionid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`DELETE FROM transactions WHERE transactionid = ? AND userid = ?`, [transactionid, userid]);
    return rows;
}