import * as repo from "../repositories/scenario.repo.js";

// ADD
export const create = async ({ userid, name, description }) => {
    name = name?.trim();

    if (!name)
        throw new Error("Scenario name is required.");

    description = description?.trim() || null;

    const result = await repo.create({ userid, name, description });
    return result;
}

// FETCH
export const fetchAll = async (userid) => {
    return await repo.fetchAll(userid);
}

export const fetchById = async ({ userid, scenarioid }) => {
    const scenario = await repo.fetchById({ userid, scenarioid });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    return scenario[0];
}

// UPDATE
export const update = async (userid, scenarioid, name, description) => {
    name = name?.trim();

    if (!name)
        throw new Error("Scenario name is required.");

    description = description?.trim() || null;

    const existing = await repo.fetchById({ userid, scenarioid });

    if (existing.length === 0)
        throw new Error("Scenario not found.");

    await repo.updateRow(userid, scenarioid, name, description);

    const updatedScenario = await repo.fetchById({ userid, scenarioid });
    return updatedScenario[0];
}

// DELETE
export const remove = async ({ userid, scenarioid }) => {
    const existing = await repo.fetchById({ userid, scenarioid });

    if (existing.length === 0)
        throw new Error("Scenario not found.");

    await repo.deleteRow({ userid, scenarioid });
}