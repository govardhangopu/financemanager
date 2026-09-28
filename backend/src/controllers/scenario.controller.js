import * as scenarioService from "../services/scenario.service.js";

// ADD
export const create = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const response = await scenarioService.create(
            { userid: req.user.id, name, description });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// FETCH
export const fetchAll = async (req, res, next) => {
    try {
        const response = await scenarioService.fetchAll({ userid: req.user.id });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const fetchById = async (req, res, next) => {
    try {
        const { scenarioid }= req.params;
        const response = await scenarioService.fetchById(
            { userid: req.user.id, scenarioid });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// UPDATE
export const update = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;
        const { name, description } = req.body;
        const response = await scenarioService.update(
            { userid: req.user.id, scenarioid, name, description });
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// DELETE
export const remove = async (req, res, next) => {
    try {
        const { scenarioid }= req.params;
        const response = await scenarioService.remove(
            { userid: req.user.id, scenarioid });
        res.json(response);
    } catch (err) {
        next(err);
    }
}