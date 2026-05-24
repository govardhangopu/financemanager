import * as budgetService from "../services/budget.service.js";

// ADD
export const addBudget = async (req, res, next) => {
    try {
        const { status, target_amount, name, description, budget_type, start_date, end_date } = req.body;
        const response = await budgetService.addBudget(
            { userid: req.user.id, status, target_amount, name, description, budget_type, start_date, end_date });
        res.json(response);
    }
    catch (err) {
        next(err);
    }
}

export const addCategoryToBudget = async (req, res, next) => {
    try {
        const { budgetid, categoryid } = req.params;
        const response = await budgetService.addCategoryToBudget(budgetid, categoryid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const addTransactionToBudget = async (req, res, next) => {
    try {
        const { budgetid, transactionid } = req.params;
        const response = await budgetService.addTransactionToBudget(budgetid, transactionid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// FETCH
export const getBudgetById = async (req, res, next) => {
    try {
        const budgetid = req.params.id;
        const response = await budgetService.getBudgetById(budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const getAllBudgets = async (req, res, next) => {
    try {
        const response = await budgetService.getAllBudgets(req.user.id);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const getBudgetTransactions = async (req, res, next) => {
    try {
        const budgetid = req.params.id;
        const response = await budgetService.getBudgetTransactions(budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const getBudgetCategories = async (req, res, next) => {
    try {
        const budgetid = req.params.id;
        const response = await budgetService.getBudgetCategories(budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const getBudgetProgress = async (req, res, next) => {
    try {
        const budgetid = req.params.id;
        const response = await budgetService.getBudgetProgress(budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// UPDATE
export const updateBudget = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid, status, target_amount, name, description, budget_type, start_date, end_date } = req.body;
        const response = await budgetService.update(
            { userid, budgetid, status, target_amount, name, description, budget_type, start_date, end_date });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// DELETE
export const deleteBudget = async (req, res, next) => {
    try {
        const budgetid = req.params.id;
        const userid = req.user.id;
        const response = await budgetService.deleteBudget(userid, budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const deleteCategoryFromBudget = async (req, res, next) => {
    try {
        const { budgetid, categoryid } = req.params;
        const response = await budgetService.removeCategoryFromBudget(budgetid, categoryid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const deleteTransactionFromBudget = async (req, res, next) => {
    try {
        const { budgetid, transactionid } = req.params;
        const response = await budgetService.removeTransactionFromBudget(budgetid, transactionid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}