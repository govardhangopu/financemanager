import * as repo from "../repositories/transaction.repo.js";

export const addTransaction = async ({ userid, amount, categoryid, is_partial, date }) => {
    const datetime = date || new Date();
    const newTransaction = await repo.create(userid, amount || 0, categoryid || null, is_partial, datetime);
    return newTransaction;
}

export const getAllTransactions = async (userid, is_partial) => {
    const transactions = await repo.fetchTransactions(userid, is_partial !== "null"  ? is_partial : null);
    return transactions;
}

export const update = async ({ userid, transactionid, amount, categoryid, is_partial, date }) => {
    if (!(transactionid && (amount || categoryid || is_partial || date))) throw new Error('No data to update.');
    const updated = await repo.updateRow(
        userid,
        transactionid, 
        amount || 0, 
        categoryid, 
        is_partial, 
        date 
);
    return updated;
}

export const deleteTransaction = async (userid, transactionid) => {
    const deleted = await repo.deleteRow(userid, transactionid);
    return deleted;
}