import * as transactionService from "../services/transaction.service.js";

export const addTransaction = async (req, res , next) => {
    try {
        const { amount, categoryid, is_partial, date } = req.body;
        const response = await transactionService.addTransaction({ userid: req.user.id, amount, categoryid, is_partial, date });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await transactionService.getAllTransactions(req.user.id, req.query.is_partial);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
}

export const updateTransaction = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { transactionid, amount, categoryid, is_partial, date } = req.body;
        const response = await transactionService.update({ userid, transactionid, amount, categoryid, is_partial, date });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const deleteTransaction = async (req, res, next) => {
    try {
        const transactionid = req.params.id;
        const userid = req.user.id;
        const response = await transactionService.deleteTransaction(userid, transactionid);
        res.json(response);
    } catch (err) {
        next(err);
    }

}