import * as scenarioChangeService from "../services/scenarioChange.service.js";

// ADD
export const create = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;

        const {
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
        } = req.body;

        const response = await scenarioChangeService.create({
            userid: req.user.id,
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

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// FETCH
export const fetchAll = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;

        const response = await scenarioChangeService.fetchAll({
            userid: req.user.id,
            scenarioid
        });

        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const fetchById = async (req, res, next) => {
    try {
        const {
            scenarioid,
            scenario_changeid
        } = req.params;

        const response = await scenarioChangeService.fetchById({
            userid: req.user.id,
            scenarioid,
            scenario_changeid
        });

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// UPDATE
export const update = async (req, res, next) => {
    try {
        const {
            scenarioid,
            scenario_changeid
        } = req.params;

        const {
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
        } = req.body;

        const response = await scenarioChangeService.update({
            userid: req.user.id,
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

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// DELETE
export const remove = async (req, res, next) => {
    try {
        const {
            scenarioid,
            scenario_changeid
        } = req.params;

        const response = await scenarioChangeService.remove({
            userid: req.user.id,
            scenarioid,
            scenario_changeid
        });

        res.json(response);
    } catch (err) {
        next(err);
    }
};
