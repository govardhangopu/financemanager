import * as repo from "../repositories/scenarioChange.repo.js";
import * as scenarioRepo from "../repositories/scenario.repo.js";

export const create = async ({
    userid,
    scenarioid,
    change_type,
    target_type,
    categoryid,
    type,
    direction,
    amount,
    frequency,
    start_date,
    end_date,
    description
}) => {

    const scenario = await scenarioRepo.fetchById({
        userid,
        scenarioid
    });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    validateChange({
        change_type,
        target_type,
        categoryid,
        type,
        direction,
        amount,
        frequency,
        start_date,
        end_date
    });

    description = description?.trim() || null;

    return await repo.create({
        scenarioid,
        change_type,
        target_type,
        categoryid,
        type,
        direction,
        amount,
        frequency,
        start_date,
        end_date,
        description
    });
};

export const fetchAll = async ({ userid, scenarioid }) => {

    const scenario = await scenarioRepo.fetchById({
        userid,
        scenarioid
    });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    return await repo.fetchAll(scenarioid);
};

export const fetchById = async ({
    userid,
    scenarioid,
    scenario_changeid
}) => {

    const scenario = await scenarioRepo.fetchById({
        userid,
        scenarioid
    });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const change = await repo.fetchById({
        scenarioid,
        scenario_changeid
    });

    if (change.length === 0)
        throw new Error("Scenario change not found.");

    return change[0];
};

export const update = async ({
    userid,
    scenarioid,
    scenario_changeid,
    change_type,
    target_type,
    categoryid,
    type,
    direction,
    amount,
    frequency,
    start_date,
    end_date,
    description
}) => {

    const scenario = await scenarioRepo.fetchById({
        userid,
        scenarioid
    });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const existing = await repo.fetchById({
        scenarioid,
        scenario_changeid
    });

    if (existing.length === 0)
        throw new Error("Scenario change not found.");

    validateChange({
        change_type,
        target_type,
        categoryid,
        type,
        direction,
        amount,
        frequency,
        start_date,
        end_date
    });

    description = description?.trim() || null;

    await repo.updateRow({
        scenarioid,
        scenario_changeid,
        change_type,
        target_type,
        categoryid,
        type,
        direction,
        amount,
        frequency,
        start_date,
        end_date,
        description
    });

    const updated = await repo.fetchById({
        scenarioid,
        scenario_changeid
    });

    return updated[0];
};

export const remove = async ({
    userid,
    scenarioid,
    scenario_changeid
}) => {

    const scenario = await scenarioRepo.fetchById({
        userid,
        scenarioid
    });

    if (scenario.length === 0)
        throw new Error("Scenario not found.");

    const existing = await repo.fetchById({
        scenarioid,
        scenario_changeid
    });

    if (existing.length === 0)
        throw new Error("Scenario change not found.");

    await repo.deleteRow({
        scenarioid,
        scenario_changeid
    });
};

const validateChange = ({
    change_type,
    target_type,
    categoryid,
    type,
    direction,
    amount,
    frequency,
    start_date,
    end_date
}) => {

    if (!["recurring", "one_time"].includes(change_type))
        throw new Error("Invalid change type.");

    if (!["category", "pattern", "new"].includes(target_type))
        throw new Error("Invalid target type.");

    if (!["increase", "decrease"].includes(direction)) {
        console.log(direction)
        throw new Error("Invalid direction.");}

    if (amount === undefined || amount === null || Number(amount) <= 0)
        throw new Error("Amount must be greater than zero.");

    if (!start_date)
        throw new Error("Start date is required.");

    if (target_type === "category" || target_type === "pattern") {

        if (!categoryid)
            throw new Error("Category is required.");

        if (type !== undefined && type !== null)
            throw new Error(
                "Type should not be provided for category or pattern changes."
            );
    }

    if (target_type === "new") {

        if (!type)
            throw new Error(
                "Type is required for a new financial flow."
            );

        if (!["income", "expense"].includes(type))
            throw new Error("Invalid transaction type.");
    }

    if (change_type === "recurring") {

        if (frequency !== "monthly")
            throw new Error(
                "Recurring changes currently support monthly frequency only."
            );
    }

    if (change_type === "one_time") {

        if (frequency !== null && frequency !== undefined)
            throw new Error(
                "One-time changes cannot have a frequency."
            );
    }

    if (end_date && end_date < start_date)
        throw new Error(
            "End date cannot be before start date."
        );
};
