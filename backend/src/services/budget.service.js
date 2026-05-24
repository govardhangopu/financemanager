import * as repo from "../repositories/budget.repo.js";

// ADD
export const addBudget = async ({ userid, status, target_amount, name, description, budget_type, start_date, end_date }) => {
    const newBudget = await repo.create(userid, status, target_amount || null, name, description || null, 
        budget_type, start_date, end_date || null);
    return newBudget;
}

export const addCategoryToBudget = async (budgetid, categoryid) => {
    const attached = await repo.attachCategory(budgetid, categoryid);
    return attached;
}

export const addTransactionToBudget = async (budgetid, transactionid) => {
    const attached = await repo.attachTransaction(budgetid, transactionid);
    return attached;
}

// FETCH
export const getBudgetById = async (budgetid) => {
    const budget = await repo.fetchBudgetById(budgetid);
    return budget;
}

export const getAllBudgets = async (userid) => {
    const budgets = await repo.fetchAllBudgets(userid);
    return budgets;
}

export const getBudgetTransactions = async (budgetid) => {
    const transactions = await repo.fetchBudgetTransactions(budgetid);
    return transactions;
}

export const getBudgetCategories = async (budgetid) => {
    const categories = await repo.fetchBudgetCategories(budgetid);
    return categories;
}

export const getBudgetProgress = async (budgetid) => {
    const budget = await repo.fetchBudgetById(budgetid);
    if (!budget.length) throw new Error('Budget not found');
    const { target_amount } = budget[0];
    const transactions = await repo.fetchBudgetTransactions(budgetid);
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const progress = target_amount ? Math.min((totalSpent / target_amount) * 100, 100) : 0;
    return { progress };
}

// UPDATE
export const update = async ({ userid, budgetid, status, target_amount, name, description, budget_type, start_date, end_date }) => {
    if (!(budgetid && (status || name || budget_type || start_date))) throw new Error('No data to update.');
    const updated = await repo.updateRow(
        userid,
        budgetid,
        status,
        target_amount || "",
        name,
        description || "",
        budget_type,
        start_date,
        end_date || ""
    );
    return updated;
}

// DELETE
export const deleteBudget = async (userid, budgetid) => {
    const deleted = await repo.deleteRow(userid, budgetid);
    return deleted;
}

export const removeCategoryFromBudget = async (budgetid, categoryid) => {
    const detached = await repo.removeCategory(budgetid, categoryid);
    return detached;
}

export const removeTransactionFromBudget = async (budgetid, transactionid) => {
    const detached = await repo.removeTransaction(budgetid, transactionid);
    return detached;
}
