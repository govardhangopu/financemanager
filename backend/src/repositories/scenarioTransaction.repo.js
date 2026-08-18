import { connectDB } from '../../config/db.js';

// ADD
export const addTransaction = async ({ scenarioid, transactionid, amount_offset = 0 }) => {
    const pool = connectDB();
    const [result] = await pool.query(`
        INSERT INTO scenario_transactions
            (scenarioid, transactionid, amount_offset)
        VALUES (?, ?, ?)
    `, [scenarioid, transactionid, amount_offset]);
    return result;
};

export const addHypothetical = async ({ scenarioid, amount, categoryid, is_partial, date }) => {
    const pool = connectDB();
    const [result] = await pool.query(`
        INSERT INTO scenario_hypothetical_transactions
            (scenarioid, amount, categoryid, is_partial, date)
        VALUES (?, ?, ?, ?, ?)
    `, [scenarioid, amount, categoryid, is_partial, date]);
    return result;
};

// FETCH
export const fetchById = async ({ scenarioid, transactionid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`
        SELECT
            st.scenarioid,
            st.transactionid,
            t.amount AS original_amount,
            t.amount + st.amount_offset AS amount,
            st.amount_offset,
            t.categoryid,
            c.name AS category_name,
            c.type,
            t.date,
            t.is_partial
        FROM scenario_transactions st
        INNER JOIN transactions t
            ON st.transactionid = t.transactionid
        LEFT JOIN categories c
            ON t.categoryid = c.categoryid
        WHERE st.scenarioid = ?
          AND st.transactionid = ?
    `, [scenarioid, transactionid]);
    return rows;
};

export const fetchAll = async ({ scenarioid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`
        SELECT
            st.scenarioid,
            st.transactionid,
            t.amount AS original_amount,
            t.amount + st.amount_offset AS amount,
            st.amount_offset,
            t.categoryid,
            c.name AS category_name,
            c.type,
            t.date,
            t.is_partial
        FROM scenario_transactions st
        INNER JOIN transactions t
            ON st.transactionid = t.transactionid
        LEFT JOIN categories c
            ON t.categoryid = c.categoryid
        WHERE st.scenarioid = ?
        ORDER BY t.date DESC
    `, [scenarioid]);
    return rows;
};

export const fetchHypotheticalById = async ({ scenarioid, hypothetical_transactionid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`
        SELECT
            ht.hypothetical_transactionid,
            ht.scenarioid,
            ht.amount,
            ht.categoryid,
            c.name AS category_name,
            c.type,
            ht.date,
            ht.is_partial
        FROM scenario_hypothetical_transactions ht
        LEFT JOIN categories c
            ON ht.categoryid = c.categoryid
        WHERE ht.scenarioid = ?
          AND ht.hypothetical_transactionid = ?
    `, [scenarioid, hypothetical_transactionid]);
    return rows;
};

// FETCH ALL
export const fetchAllHypothetical = async ({ scenarioid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`
        SELECT
            ht.hypothetical_transactionid,
            ht.scenarioid,
            ht.amount,
            ht.categoryid,
            c.name AS category_name,
            c.type,
            ht.date,
            ht.is_partial
        FROM scenario_hypothetical_transactions ht
        LEFT JOIN categories c
            ON ht.categoryid = c.categoryid
        WHERE ht.scenarioid = ?
        ORDER BY ht.date DESC
    `, [scenarioid]);
    return rows;
};

export const fetchSummary = async ({ scenarioid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
            COALESCE(SUM(CASE
                WHEN type = 'income' THEN amount
                WHEN type = 'expense' THEN -amount
                ELSE 0
            END), 0) AS net
        FROM (
            SELECT
                t.amount + st.amount_offset AS amount,
                c.type
            FROM scenario_transactions st
            INNER JOIN transactions t
                ON st.transactionid = t.transactionid
            LEFT JOIN categories c
                ON t.categoryid = c.categoryid
            WHERE st.scenarioid = ?

            UNION ALL

            SELECT
                ht.amount,
                c.type
            FROM scenario_hypothetical_transactions ht
            LEFT JOIN categories c
                ON ht.categoryid = c.categoryid
            WHERE ht.scenarioid = ?
        ) scenario_transactions
    `, [scenarioid, scenarioid]);
    return rows[0];
};

// UPDATE
export const updateOffset = async ({ scenarioid, transactionid, amount_offset }) => {
    const pool = connectDB();
    const [result] = await pool.query(`
        UPDATE scenario_transactions
        SET amount_offset = ?
        WHERE scenarioid = ?
          AND transactionid = ?
    `, [amount_offset, scenarioid, transactionid]);
    return result;
};

export const updateHypothetical = async ({ scenarioid, hypothetical_transactionid, amount, categoryid, is_partial, date }) => {
    const pool = connectDB();
    const [result] = await pool.query(`
        UPDATE scenario_hypothetical_transactions
        SET amount = ?,
            categoryid = ?,
            is_partial = ?,
            date = ?
        WHERE scenarioid = ?
          AND hypothetical_transactionid = ?
    `, [amount, categoryid, is_partial, date, scenarioid, hypothetical_transactionid]);
    return result;
};

// DELETE
export const remove = async ({ scenarioid, transactionid }) => {
    const pool = connectDB();
    const [result] = await pool.query(`
        DELETE FROM scenario_transactions
        WHERE scenarioid = ?
          AND transactionid = ?
    `, [scenarioid, transactionid]);
    return result;
};

export const removeHypothetical = async ({ scenarioid, hypothetical_transactionid }) => {
    const pool = connectDB();
    const [result] = await pool.query(`
        DELETE FROM scenario_hypothetical_transactions
        WHERE scenarioid = ?
          AND hypothetical_transactionid = ?
    `, [scenarioid, hypothetical_transactionid]);
    return result;
};