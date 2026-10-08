import * as repo from "../repositories/budget.repo.js";
import * as categoryRepo from "../repositories/category.repo.js";

const VALID_BUDGET_TYPES = [
    "monthly",
    "yearly",
    "one_time",
    "other"
];

const validateBudget = ({
    name,
    target_amount,
    budget_type,
    start_date,
    end_date
}) => {
    if (!name?.trim()) {
        throw new Error("Budget name is required.");
    }

    if (
        target_amount === undefined ||
        target_amount === null ||
        Number(target_amount) <= 0
    ) {
        throw new Error("Target amount must be greater than zero.");
    }

    if (!VALID_BUDGET_TYPES.includes(budget_type)) {
        throw new Error("Invalid budget type.");
    }

    if (!start_date) {
        throw new Error("Start date is required.");
    }

    const start = new Date(start_date);

    if (Number.isNaN(start.getTime())) {
        throw new Error("Invalid start date.");
    }

    if (end_date) {
        const end = new Date(end_date);

        if (Number.isNaN(end.getTime())) {
            throw new Error("Invalid end date.");
        }

        if (end < start) {
            throw new Error("End date cannot be before start date.");
        }
    }
};

// Dynamic Status Calculator
const calculateStatus = (start_date, end_date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(start_date);
    startDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
        return "upcoming";
    }

    if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(0, 0, 0, 0);

        if (today > endDate) {
            return "completed";
        }
    }

    return "active";
};

const getOwnedBudget = async (userid, budgetid) => {
    const budgets = await repo.fetchBudgetById(userid, budgetid);

    if (budgets.length === 0) {
        throw new Error("Budget not found.");
    }

    return budgets[0];
};

// ADD
export const addBudget = async ({ userid, target_amount, name, description, budget_type, start_date, end_date }) => {
    validateBudget({ name, target_amount, budget_type, start_date, end_date });

    const status = calculateStatus(start_date, end_date);

    return await repo.create(userid, status, Number(target_amount), name.trim(), description?.trim() || null, budget_type, start_date, end_date || null);
};

export const addCategoryToBudget = async (userid, budgetid, categoryid) => {
    await getOwnedBudget(userid, budgetid);

    const category = await categoryRepo.fetchById(userid, categoryid);

    if (category.length === 0) {
        throw new Error("Category not found or not accessible.");
    }

    if (category[0].type !== "expense") {
        throw new Error("Only expense categories can be added to a budget.");
    }

    return await repo.attachCategoryToBudget(budgetid, categoryid);
};

export const addTransactionToBudget = async (budgetid, transactionid) => {
    const attached = await repo.attachTransactionToBudget(budgetid, transactionid);
    return attached;
}

// FETCH
export const getBudgetById = async (userid, budgetid) => {
    const budget = await getOwnedBudget(userid, budgetid);

    const status = calculateStatus(
        budget.start_date,
        budget.end_date
    );

    return [{ ...budget, status }];
};

export const getAllBudgets = async (userid) => {
    const budgets = await repo.fetchAllBudgets(userid);

    return budgets.map(budget => ({
        ...budget,
        status: calculateStatus(
            budget.start_date,
            budget.end_date
        )
    }));
};

export const getBudgetTransactions = async (userid, budgetid) => {
    await getOwnedBudget(userid, budgetid);
    return await repo.fetchBudgetTransactions(budgetid);
};

export const getBudgetCategories = async (userid, budgetid) => {
    await getOwnedBudget(userid, budgetid);
    return await repo.fetchBudgetCategories(budgetid);
};

export const getBudgetProgress = async (userid, budgetid) => {
    const budget = await getOwnedBudget(userid, budgetid);
    const transactions = await repo.fetchBudgetTransactions(budgetid);
    const totalSpent = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    const targetAmount = Number(budget.target_amount);

    const progress = targetAmount > 0 ? Math.min((totalSpent / targetAmount) * 100, 100) : 0;
    return { progress };
};

// UPDATE
export const update = async ({ userid, budgetid, target_amount, name, description, budget_type, start_date, end_date }) => {
    const existing = await getOwnedBudget(userid, budgetid);

    const finalBudget = {
        name: name !== undefined
            ? name
            : existing.name,

        target_amount: target_amount !== undefined
            ? target_amount
            : existing.target_amount,

        budget_type: budget_type !== undefined
            ? budget_type
            : existing.budget_type,

        start_date: start_date !== undefined
            ? start_date
            : existing.start_date,

        end_date: end_date !== undefined
            ? end_date
            : existing.end_date
    };

    validateBudget(finalBudget);

    const status = calculateStatus(finalBudget.start_date, finalBudget.end_date);

    return await repo.updateRow(
        userid,
        budgetid,
        status,
        Number(finalBudget.target_amount),
        finalBudget.name.trim(),
        description !== undefined
            ? description?.trim() || null
            : existing.description,
        finalBudget.budget_type,
        finalBudget.start_date,
        finalBudget.end_date || null
    );
};

// DELETE
export const deleteBudget = async (userid, budgetid) => {
    const deleted = await repo.deleteRow(userid, budgetid);
    return deleted;
}

export const removeCategoryFromBudget = async (userid, budgetid, categoryid) => {
    await getOwnedBudget(userid, budgetid);
    return await repo.detachCategoryFromBudget(budgetid, categoryid);
};

export const removeTransactionFromBudget = async (budgetid, transactionid) => {
    const detached = await repo.detachTransactionFromBudget(budgetid, transactionid);
    return detached;
}
