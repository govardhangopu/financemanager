import * as repo from "../repositories/transaction.repo.js";
import * as categoryRepo from "../repositories/category.repo.js";

const validateCategory = async (userid, categoryid) => {
    if (!categoryid) return null;

    const categories = await categoryRepo.fetchById(userid, categoryid);

    if (categories.length === 0) {
        throw new Error("Category not found or not accessible.");
    }

    return categories[0];
};

const validateAmount = (amount) => {
    if (amount === undefined || amount === null || Number(amount) <= 0) {
        throw new Error("Amount must be greater than zero.");
    }
};

const validateIsPartial = (is_partial) => {
    if (![0, 1].includes(Number(is_partial))) {
        throw new Error("Invalid partial transaction value.");
    }
};

export const addTransaction = async ({ userid, amount, categoryid, is_partial, date }) => {
    validateAmount(amount);
    validateIsPartial(is_partial);

    await validateCategory(userid, categoryid);
    const datetime = date || new Date();

    return await repo.create(userid, Number(amount), categoryid || null, Number(is_partial), datetime);
};

export const getAllTransactions = async (userid, is_partial) => {
    let partial = null;

    if (is_partial !== undefined && is_partial !== null && is_partial !== "null") {
        partial = Number(is_partial);

        validateIsPartial(partial);
    }

    return await repo.fetchTransactions(userid, partial);
};

export const update = async ({ userid, transactionid, amount, categoryid, is_partial, date }) => {
    if (!transactionid) {
        throw new Error("Transaction ID is required.");
    }

    if (
        amount === undefined &&
        categoryid === undefined &&
        is_partial === undefined &&
        date === undefined
    ) {
        throw new Error("No data to update.");
    }

    const existing = await repo.fetchById(userid, transactionid);

    if (existing.length === 0) {
        throw new Error("Transaction not found.");
    }

    const current = existing[0];

    const newAmount =
        amount !== undefined
            ? Number(amount)
            : Number(current.amount);

    const newCategoryId =
        categoryid !== undefined
            ? categoryid
            : current.categoryid;

    const newIsPartial =
        is_partial !== undefined
            ? Number(is_partial)
            : Number(current.is_partial);

    const newDate =
        date !== undefined
            ? date
            : current.date;

    validateAmount(newAmount);
    validateIsPartial(newIsPartial);

    await validateCategory(userid, newCategoryId);

    return await repo.updateRow(
        userid,
        transactionid,
        newAmount,
        newCategoryId,
        newIsPartial,
        newDate
    );
};

export const deleteTransaction = async (userid, transactionid) => {
    const deleted = await repo.deleteRow(userid, transactionid);
    return deleted;
}