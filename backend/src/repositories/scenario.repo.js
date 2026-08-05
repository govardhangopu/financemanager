import { connectDB } from '../../config/db.js';

// ADD
export const create = async ({ userid, name, description }) => {
    const pool = connectDB();
    const [result] = await pool.query(`INSERT INTO scenarios(userid, name, description)
        VALUES (?, ?, ?)`, [userid, name, description]);
    return await fetchById(userid, result.insertId);;
}

// FETCH
export const fetchAll = async (userid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT * FROM scenarios WHERE userid = ? ORDER BY created_at DESC;`, [userid]);
    return rows;
}

export const fetchById = async ({ userid, scenarioid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT * FROM scenarios WHERE userid = ? AND scenarioid = ?;`, [userid, scenarioid]);
    return rows;
}

// UPDATE
export const updateRow = async ({ userid, scenarioid, name, description }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`UPDATE scenarios SET name = ?, description = ? WHERE userid = ? AND scenarioid = ?;`, [name, description, userid, scenarioid])
    return rows;
}

// DELETE
export const deleteRow = async ({ userid, scenarioid }) => {
    const pool = connectDB();
    const [rows] = await pool.query(`DELETE FROM scenarios WHERE userid = ? AND scenarioid = ?;`, [userid, scenarioid]);
    return rows;
}