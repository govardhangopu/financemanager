import { connectDB } from "../../config/db.js";

export const create = async ({
    scenarioid,
    change_type,
    target_type,
    categoryid,
    type,
    direction,
    amount,
    frequency,
    start_date,
    end_date,
    description
}) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `INSERT INTO scenario_changes
        (
            scenarioid,
            change_type,
            target_type,
            categoryid,
            type,
            direction,
            amount,
            frequency,
            start_date,
            end_date,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            scenarioid,
            change_type,
            target_type,
            categoryid,
            type,
            direction,
            amount,
            frequency,
            start_date,
            end_date,
            description
        ]
    );

    return await fetchById({ scenarioid, scenario_changeid: result.insertId });
};

export const fetchAll = async (scenarioid) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `SELECT sc.*, c.name AS category_name
         FROM scenario_changes sc
         LEFT JOIN categories c ON sc.categoryid = c.categoryid
         WHERE sc.scenarioid = ?
         ORDER BY sc.created_at ASC`,
        [scenarioid]
    );

    return rows;
};

export const fetchById = async ({ scenarioid, scenario_changeid }) => {
    const pool = connectDB();

    const [rows] = await pool.query(
        `SELECT *
         FROM scenario_changes
         WHERE scenarioid = ?
         AND scenario_changeid = ?`,
        [scenarioid, scenario_changeid]
    );

    return rows;
};

export const updateRow = async ({
    scenarioid,
    scenario_changeid,
    change_type,
    target_type,
    categoryid,
    type,
    direction,
    amount,
    frequency,
    start_date,
    end_date,
    description
}) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `UPDATE scenario_changes
         SET
            change_type = ?,
            target_type = ?,
            categoryid = ?,
            type = ?,
            direction = ?,
            amount = ?,
            frequency = ?,
            start_date = ?,
            end_date = ?,
            description = ?
         WHERE scenarioid = ?
         AND scenario_changeid = ?`,
        [
            change_type,
            target_type,
            categoryid,
            type,
            direction,
            amount,
            frequency,
            start_date,
            end_date,
            description,
            scenarioid,
            scenario_changeid
        ]
    );

    return result;
};

export const deleteRow = async ({ scenarioid, scenario_changeid }) => {
    const pool = connectDB();

    const [result] = await pool.query(
        `DELETE FROM scenario_changes
         WHERE scenarioid = ?
         AND scenario_changeid = ?`,
        [scenarioid, scenario_changeid]
    );

    return result;
};
