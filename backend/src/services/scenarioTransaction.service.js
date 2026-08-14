import * as scenarioRepo from "../repositories/scenario.repo.js";
import * as transactionRepo from "../repositories/transaction.repo.js";
import * as repo from "../repositories/scenarioTransaction.repo.js";

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

// FETCH
export const fetchAll = async ({ userid, scenarioid }) => {
    const scenario = await scenarioRepo.fetchById({ userid, scenarioid });
    if (scenario.length === 0)
        throw new Error("Scenario not found.");
    return await repo.fetchAll({ scenarioid });
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