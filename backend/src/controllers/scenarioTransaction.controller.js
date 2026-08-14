import * as scenarioTransactionService from "../services/scenarioTransaction.service.js";

// ADD
export const addTransaction = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;
        const { transactionid, amount_offset } = req.body;
        const response = await scenarioTransactionService.addTransaction({ userid: req.user.id, scenarioid, transactionid, amount_offset });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

// FETCH
export const fetchAll = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;
        const response = await scenarioTransactionService.fetchAll({ userid: req.user.id, scenarioid });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

// UPDATE
export const updateOffset = async (req, res, next) => {
    try {
        const { scenarioid, transactionid } = req.params;
        const { amount_offset } = req.body;
        const response = await scenarioTransactionService.updateOffset({ userid: req.user.id, scenarioid, transactionid, amount_offset });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

// DELETE
export const removeTransaction = async (req, res, next) => {
    try {
        const { scenarioid, transactionid } = req.params;
        const response = await scenarioTransactionService.removeTransaction({ userid: req.user.id, scenarioid, transactionid });
        res.json(response);
    } catch (err) {
        next(err);
    }
};