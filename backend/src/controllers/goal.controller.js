import * as goalService from "../services/goal.service.js";

export const create = async (req, res, next) => {
    try {
        const goalid = await goalService.create({
            userid: req.user.id,
            name: req.body.name,
            target_amount: req.body.target_amount,
            target_date: req.body.target_date,
            description: req.body.description
        });

        const goal = await goalService.fetchById({
            userid: req.user.id,
            goalid
        });

        res.status(201).json(goal);
    } catch (err) {
        next(err);
    }
};

export const fetchAll = async (req, res, next) => {
    try {
        const goals = await goalService.fetchAll({
            userid: req.user.id
        });

        res.json(goals);
    } catch (err) {
        next(err);
    }
};

export const fetchById = async (req, res, next) => {
    try {
        const goal = await goalService.fetchById({
            userid: req.user.id,
            goalid: req.params.goalid
        });

        res.json(goal);
    } catch (err) {
        next(err);
    }
};

export const update = async (req, res, next) => {
    try {
        const goal = await goalService.update({
            userid: req.user.id,
            goalid: req.params.goalid,
            name: req.body.name,
            target_amount: req.body.target_amount,
            target_date: req.body.target_date,
            description: req.body.description
        });

        res.json(goal);
    } catch (err) {
        next(err);
    }
};

export const remove = async (req, res, next) => {
    try {
        const response = await goalService.remove({
            userid: req.user.id,
            goalid: req.params.goalid
        });

        res.json(response);
    } catch (err) {
        next(err);
    }
};