import { connectDB } from "../../config/db.js";

// ADD
export const create = async (userid, status, target_amount, name, description, budget_type, start_date, end_date) => {
    const pool = connectDB();
    const [rows] = await pool.query(`INSERT INTO budgets(userid, status, target_amount, name, description, budget_type, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [userid, status, target_amount, name, description, budget_type, start_date, end_date]);
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
export const fetchBudgetById = async (budgetid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT * FROM budgets WHERE budgetid = ?`, [budgetid]);
    return rows;
}

export const fetchAllBudgets = async (userid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT * FROM budgets WHERE userid = ?`, [userid]);
    return rows;
}

export const fetchBudgetTransactions = async (budgetid) => {
    const pool = connectDB();
    const [rows] = await pool.query(`SELECT t.*, c.name as category_name, c.type, c.parent_categoryid 
    FROM budget_transactions bt 
    join transactions t on bt.transactionid = t.transactionid
    join categories c on t.categoryid = c.categoryid
    WHERE bt.budgetid = ?`, [budgetid]);
    return rows;
}

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
    if (target_amount) fields.push("target_amount = ?") && values.push(target_amount);
    if (name) fields.push("name = ?") && values.push(name);
    if (description) fields.push("description = ?") && values.push(description);
    if (budget_type) fields.push("budget_type = ?") && values.push(budget_type);
    if (start_date) fields.push("start_date = ?") && values.push(start_date);
    if (end_date) fields.push("end_date = ?") && values.push(end_date);

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