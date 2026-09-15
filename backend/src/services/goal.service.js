import * as repo from "../repositories/goal.repo.js";

const validateGoal = ({ name, target_amount, target_date }) => {
    if (!name || !name.trim()) {
        throw new Error("Goal name is required.");
    }

    if (name.trim().length > 100) {
        throw new Error("Goal name must not exceed 100 characters.");
    }

    const amount = Number(target_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Goal target amount must be greater than 0.");
    }

    if (!target_date) {
        throw new Error("Goal target date is required.");
    }

    const targetDate = new Date(target_date);

    if (Number.isNaN(targetDate.getTime())) {
        throw new Error("Invalid goal target date.");
    }

    return {
        name: name.trim(),
        target_amount: amount,
        target_date
    };
};

export const create = async ({ userid, name, target_amount, target_date, description }) => {
    const validated = validateGoal({ name, target_amount, target_date });

    return await repo.create({
        userid,
        ...validated,
        description: description?.trim() || null
    });
};

export const fetchAll = async ({ userid }) => {
    return await repo.fetchAll(userid);
};

export const fetchById = async ({ userid, goalid }) => {
    const goals = await repo.fetchById(userid, goalid);

    if (goals.length === 0) {
        throw new Error("Goal not found.");
    }

    return goals[0];
};

export const update = async ({ userid, goalid, name, target_amount, target_date, description }) => {
    const validated = validateGoal({ name, target_amount, target_date });

    const result = await repo.update({
        userid,
        goalid,
        ...validated,
        description: description?.trim() || null
    });

    if (result.affectedRows === 0) {
        throw new Error("Goal not found.");
    }

    return await fetchById({ userid, goalid });
};

export const remove = async ({ userid, goalid }) => {
    const result = await repo.remove(userid, goalid);

    if (result.affectedRows === 0) {
        throw new Error("Goal not found.");
    }

    return { message: "Goal deleted successfully." };
};