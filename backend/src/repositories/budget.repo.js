import { connectDB } from "../../config/db.js";

// ADD
export const create = async (userid, status, target_amount, name, description, budget_type, start_date, end_date) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO budgets(userid, status, target_amount, name, description, budget_type, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userid, status, target_amount, name, description, budget_type, start_date, end_date]);
    return rows;
}

export const attachTransactionToBudget = async (budgetid, transactionid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO budget_transactions(budgetid, transactionid) VALUES (?, ?)`, [budgetid, transactionid]);
    return rows;
}

export const attachCategoryToBudget = async (budgetid, categoryid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO budget_categories(budgetid, categoryid) VALUES (?, ?)`, [budgetid, categoryid]);
    return rows;
}

// FETCH
export const fetchBudgetById = async (userid, budgetid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT * FROM budgets WHERE budgetid = ? AND userid = ?`, [budgetid, userid]);
    return rows;
};

export const fetchAllBudgets = async (userid) => {
    const pool = connectDB();
    const [rows] = await pool.query(
        `
        SELECT
            b.*,

            COALESCE((
                SELECT SUM(t.amount)
                FROM transactions t
                INNER JOIN categories c
                    ON t.categoryid = c.categoryid

                WHERE t.categoryid IN (
                    WITH RECURSIVE budget_category_tree AS (
                        SELECT bc.categoryid
                        FROM budget_categories bc
                        WHERE bc.budgetid = b.budgetid

                        UNION ALL

                        SELECT child.categoryid
                        FROM categories child
                        INNER JOIN budget_category_tree parent
                            ON child.parent_categoryid = parent.categoryid
                    )

                    SELECT categoryid
                    FROM budget_category_tree
                )

                AND c.type = 'expense'
                AND t.date >= b.start_date
                AND (
                    b.end_date IS NULL
                    OR t.date <= b.end_date
                )
            ), 0) AS spent_amount

        FROM budgets b
        WHERE b.userid = ?
        `,
        [userid]
    );
    return rows;
};

export const fetchBudgetTransactions = async (budgetid) => {
    const pool = connectDB();
    const [rows] = await pool.query(
        `
        WITH RECURSIVE budget_category_tree AS (
            SELECT bc.categoryid
            FROM budget_categories bc
            WHERE bc.budgetid = ?

            UNION ALL

            SELECT c.categoryid
            FROM categories c
            INNER JOIN budget_category_tree bct
                ON c.parent_categoryid = bct.categoryid
        )

        SELECT DISTINCT
            t.*,
            c.name AS category_name,
            c.type,
            c.parent_categoryid
        FROM transactions t
        INNER JOIN categories c
            ON t.categoryid = c.categoryid
        INNER JOIN budgets b
            ON b.budgetid = ?
        WHERE t.categoryid IN (
            SELECT categoryid
            FROM budget_category_tree
        )
        AND c.type = 'expense'
        AND t.date >= b.start_date
        AND (
            b.end_date IS NULL
            OR t.date <= b.end_date
        )
        `,
        [budgetid, budgetid]
    );
    return rows;
};

export const fetchBudgetCategories = async (budgetid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT c.* FROM budget_categories bc
    join categories c on bc.categoryid = c.categoryid
    WHERE bc.budgetid = ?`, [budgetid]);
    return rows;
}

//UPDATE
export const updateRow = async (userid, budgetid, status, target_amount, name, description, budget_type, start_date, end_date) => {
    const pool = connectDB();
    const fields = [], values = [];

    if (status) fields.push("status = ?") && values.push(status);
    if (target_amount !== undefined) fields.push("target_amount = ?") && values.push(target_amount);
    if (name !== undefined) fields.push("name = ?") && values.push(name);
    if (description !== undefined) fields.push("description = ?") && values.push(description);
    if (budget_type) fields.push("budget_type = ?") && values.push(budget_type);
    if (start_date!== undefined) fields.push("start_date = ?") && values.push(start_date);
    if (end_date !== undefined) fields.push("end_date = ?") && values.push(end_date);

    const sql = `
    UPDATE budgets SET 
    ${fields.join(", ")} 
    WHERE budgetid = ? 
    AND userid = ?
    `;

    values.push(budgetid, userid);

    const [rows] = await pool.query(sql, values);
    return rows;
}

// DELETE
export const deleteRow = async (userid, budgetid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`DELETE FROM budgets WHERE budgetid = ? AND userid = ?`, [budgetid, userid]);
    return rows;
}

export const detachTransactionFromBudget = async (budgetid, transactionid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`DELETE FROM budget_transactions WHERE budgetid = ? AND transactionid = ?`, [budgetid, transactionid]);
    return rows;
}

export const detachCategoryFromBudget = async (budgetid, categoryid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`DELETE FROM budget_categories WHERE budgetid = ? AND categoryid = ?`, [budgetid, categoryid]);
    return rows;
}