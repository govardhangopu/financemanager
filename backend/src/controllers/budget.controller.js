import * as budgetService from "../services/budget.service.js";

// ADD
export const addBudget = async (req, res, next) => {
    try {
        const { target_amount, name, description, budget_type, start_date, end_date } = req.body;
        const response = await budgetService.addBudget(
            { userid: req.user.id, target_amount, name, description, budget_type, start_date, end_date });
        res.json(response);
    }
    catch (err) {
        next(err);
    }
}

export const addCategoryToBudget = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid, categoryid } = req.params;
        const response = await budgetService.addCategoryToBudget(userid, budgetid, categoryid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const addTransactionToBudget = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid, transactionid } = req.params;
        const response = await budgetService.addTransactionToBudget(userid, budgetid, transactionid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

// FETCH
export const getBudgetById = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid } = req.params;
        const response = await budgetService.getBudgetById(userid, budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

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
        const userid = req.user.id;
        const { budgetid } = req.params;
        const response = await budgetService.getBudgetTransactions(userid, budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const getBudgetCategories = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid } = req.params;
        const response = await budgetService.getBudgetCategories(userid, budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const getBudgetProgress = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid } = req.params;
        const response = await budgetService.getBudgetProgress(userid, budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

// UPDATE
export const updateBudget = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid, target_amount, name, description, budget_type, start_date, end_date } = req.body;
        const response = await budgetService.update(
            { userid, budgetid, target_amount, name, description, budget_type, start_date, end_date });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// DELETE
export const deleteBudget = async (req, res, next) => {
    try {
        const budgetid = req.params.budgetid;
        const userid = req.user.id;
        const response = await budgetService.deleteBudget(userid, budgetid);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const deleteCategoryFromBudget = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid, categoryid } = req.params;
        const response = await budgetService.removeCategoryFromBudget(userid, budgetid, categoryid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const deleteTransactionFromBudget = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { budgetid, transactionid } = req.params;
        const response = await budgetService.removeTransactionFromBudget(userid, budgetid, transactionid);
        res.json(response);
    } catch (err) {
        next(err);
    }
};