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

export const addHypothetical = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;
        const { amount, categoryid, is_partial, date } = req.body;
        const response = await scenarioTransactionService.addHypothetical({ userid: req.user.id, scenarioid, amount, categoryid, is_partial, date });
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

export const fetchHypotheticalById = async (req, res, next) => {
    try {
        const { scenarioid, hypothetical_transactionid } = req.params;
        const response = await scenarioTransactionService.fetchHypotheticalById({ userid: req.user.id,
            scenarioid, hypothetical_transactionid });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const fetchAllHypothetical = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;
        const response = await scenarioTransactionService.fetchAllHypothetical({ userid: req.user.id, scenarioid });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const getSummary = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;
        const response = await scenarioTransactionService.getSummary({ userid: req.user.id, scenarioid });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

// UPDATE
export const updateHypothetical = async (req, res, next) => {
    try {
        const { scenarioid, hypothetical_transactionid } = req.params;
        const { amount, categoryid, is_partial, date } = req.body;
        const response = await scenarioTransactionService.updateHypothetical({ userid: req.user.id, scenarioid, hypothetical_transactionid, amount, categoryid, is_partial, date });
        res.json(response);
    } catch (err) {
        next(err);
    }
};

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

export const removeHypothetical = async (req, res, next) => {
    try {
        const { scenarioid, hypothetical_transactionid } = req.params;
        const response = await scenarioTransactionService.removeHypothetical({ userid: req.user.id, scenarioid, hypothetical_transactionid });
        res.json(response);
    } catch (err) {
        next(err);
    }
};