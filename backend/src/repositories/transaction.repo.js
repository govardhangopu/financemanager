import { connectDB } from "../../config/db.js";

export const create = async (userid, amount, categoryid, is_partial, datetime) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO transactions(userid, amount, categoryid, is_partial, date)
        VALUES (?, ?, ?, ?, ?)`, [userid, amount, categoryid, is_partial, datetime]);
    return rows;
}

export const fetchTransactions = async (userid, is_partial = null) => {
    const pool = connectDB();
    const values = [userid];
    if (is_partial) values.push(is_partial);
    const [rows] = await pool.query(`
        SELECT t.*, c.name as category_name, c.type, c.parent_categoryid 
        FROM transactions t 
        join categories c on t.categoryid = c.categoryid 
        WHERE t.userid = ? ${is_partial ? "and is_partial = ?" : ""}`, 
        values);
    return rows;
}

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