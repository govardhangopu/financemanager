import { connectDB } from "../../config/db.js";

// ADD
export const addCategory = async (userid, name, type, parent_categoryid, is_partial) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO categories (userid, name, type, parent_categoryid, is_partial)
        VALUES (?, ?, ?, ?, ?)`, [userid, name, type, parent_categoryid, is_partial]);
    return rows;
}

// FETCH
export const fetchById = async (userid, categoryid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT * FROM categories WHERE categoryid = ? AND (userid = ? OR userid IS NULL)
    `, [categoryid, userid]);
    return rows;
}

export const getCategories = async (userid, is_partial = null) => {
    const pool = connectDB();
    const values = [userid];
    if (is_partial) values.push(is_partial);
    const [rows] = await pool.query(`
        SELECT *
        FROM categories
        WHERE (userid = ? OR userid IS NULL)
        ${is_partial ? "AND is_partial = ?" : ""}
    `, values);

    return rows;
}

export const fetchDescendants = async (userid, categoryid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`
        WITH RECURSIVE category_tree AS (
            SELECT
                categoryid,
                name,
                type,
                parent_categoryid,
                userid,
                is_partial
            FROM categories
            WHERE categoryid = ?
              AND (userid = ? OR userid IS NULL)

            UNION ALL

            SELECT
                c.categoryid,
                c.name,
                c.type,
                c.parent_categoryid,
                c.userid,
                c.is_partial
            FROM categories c
            INNER JOIN category_tree ct
                ON c.parent_categoryid = ct.categoryid
            WHERE c.userid = ? OR c.userid IS NULL
        )
        SELECT *
        FROM category_tree
        `, [categoryid, userid, userid]
    );

    return rows;
};

// UPDATE
export const updateCategory = async (userid, categoryid, name, parent_categoryid, is_partial) => {
    const pool = connectDB();

    const fields = [], values = [];

    if (name) fields.push("name = ?") && values.push(name);
    if (parent_categoryid) fields.push("parent_categoryid = ?") && values.push(parent_categoryid);
    if (is_partial) fields.push("is_partial = ?") && values.push(is_partial);

    const sql = `
    UPDATE categories SET 
    ${fields.join(", ")} 
    WHERE categoryid = ? 
    AND userid = ?
    `;

    values.push(categoryid, userid);

    const [rows] = await pool.query(sql, values);
    return rows;
}

// DELETE
export const deleteCategory = async (userid, categoryid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`DELETE FROM categories WHERE categoryid = ? AND userid = ?`, [categoryid, userid]);
    return rows;
}