import * as scenarioRepo from "../repositories/scenario.repo.js";
import * as transactionRepo from "../repositories/transaction.repo.js";
import * as repo from "../repositories/scenarioTransaction.repo.js";
import * as categoryRepo from "../repositories/category.repo.js";

// ADD
export const addTransaction = async ({ userid, scenarioid, transactionid, amount_offset = 0 }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");
    const transaction = await transactionRepo.fetchById(userid, transactionid);

    if (transaction.length === 0)
        throw new Error("Transaction not found.");

    const existing = await repo.fetchById({ scenarioid, transactionid });

    if (existing.length > 0)
        throw new Error("Transaction is already included in this scenario.");

    amount_offset = Number(amount_offset);

    if (!Number.isFinite(amount_offset))
        throw new Error("Invalid transaction offset.");

    await repo.addTransaction({ scenarioid, transactionid, amount_offset });
    const result = await repo.fetchById({ scenarioid, transactionid });
    return result[0];
};

export const addHypothetical = async ({ userid, scenarioid, amount, categoryid, is_partial, date }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
        throw new Error("Invalid transaction amount.");
    if (categoryid !== null && categoryid !== undefined) {
        const category = await categoryRepo.fetchById(userid, categoryid);
        if (category.length === 0)
            throw new Error("Category not found.");
    }
    if (!date)
        throw new Error("Transaction date is required.");

    const result = await repo.addHypothetical({ scenarioid, amount, categoryid: categoryid ?? null, is_partial: is_partial ?? 0, date });
    return await repo.fetchHypotheticalById({ scenarioid, hypothetical_transactionid: result.insertId });
};

// FETCH
export const fetchAll = async ({ userid, scenarioid }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const realTransactions = await repo.fetchAll({ scenarioid });
    const hypotheticalTransactions = await repo.fetchAllHypothetical({ scenarioid });

    const real = realTransactions.map(transaction => ({ ...transaction, scenario_type: "real" }));
    const hypothetical = hypotheticalTransactions.map(transaction => ({ ...transaction, scenario_type: "hypothetical" }));
    return [...real, ...hypothetical].sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const fetchHypotheticalById = async ({ userid, scenarioid, hypothetical_transactionid }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const result = await repo.fetchHypotheticalById({ scenarioid, hypothetical_transactionid });
    if (result.length === 0)
        throw new Error("Hypothetical transaction not found.");
    return result[0];
};

export const fetchAllHypothetical = async ({ userid, scenarioid }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");
    return await repo.fetchAllHypothetical({ scenarioid });
};

// UPDATE
export const updateOffset = async ({ userid, scenarioid, transactionid, amount_offset }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");
    const transaction = await transactionRepo.fetchById(userid, transactionid);

    if (transaction.length === 0)
        throw new Error("Transaction not found.");

    const existing = await repo.fetchById({ scenarioid, transactionid });

    if (existing.length === 0)
        throw new Error("Transaction is not included in this scenario.");

    amount_offset = Number(amount_offset);

    if (!Number.isFinite(amount_offset))
        throw new Error("Invalid transaction offset.");

    await repo.updateOffset({ scenarioid, transactionid, amount_offset });
    const result = await repo.fetchById({ scenarioid, transactionid });
    return result[0];
};

export const updateHypothetical = async ({ userid, scenarioid, hypothetical_transactionid, amount, categoryid, is_partial, date }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const existing = await repo.fetchHypotheticalById({ scenarioid, hypothetical_transactionid });

    if (existing.length === 0)
        throw new Error("Hypothetical transaction not found.");
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
        throw new Error("Invalid transaction amount.");
    if (categoryid !== null && categoryid !== undefined) {
        const category = await categoryRepo.fetchById(userid, categoryid);
        if (category.length === 0)
            throw new Error("Category not found.");
    }

    if (!date)
        throw new Error("Transaction date is required.");

    await repo.updateHypothetical({ scenarioid, hypothetical_transactionid, amount, categoryid: categoryid ?? null, is_partial: is_partial ?? 0, date });
    const result = await repo.fetchHypotheticalById({ scenarioid, hypothetical_transactionid });
    return result[0];
};

// DELETE
export const removeTransaction = async ({ userid, scenarioid, transactionid }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const transaction = await transactionRepo.fetchById(userid, transactionid);

    if (transaction.length === 0)
        throw new Error("Transaction not found.");

    const existing = await repo.fetchById({ scenarioid, transactionid });

    if (existing.length === 0)
        throw new Error("Transaction is not included in this scenario.");
    await repo.remove({ scenarioid, transactionid });
};

export const removeHypothetical = async ({ userid, scenarioid, hypothetical_transactionid }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const existing = await repo.fetchHypotheticalById({ scenarioid, hypothetical_transactionid });
    if (existing.length === 0)
        throw new Error("Hypothetical transaction not found.");
    await repo.removeHypothetical({ scenarioid, hypothetical_transactionid });
};