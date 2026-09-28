import * as scenarioProjectionService from "../services/scenarioProjection.service.js";

// FETCH
export const getProjection = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;

        const months =
            Number(req.query.months) || 12;

        const startDate =
            req.query.start_date ||
            new Date().toISOString().split("T")[0];

        if (months <= 0 || months > 120) {
            throw new Error(
                "Projection months must be between 1 and 120."
            );
        }

        const response =
            await scenarioProjectionService.getScenarioProjection({
                userid: req.user.id,
                scenarioid,
                projectionStartDate: startDate,
                months
            });

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// SIMULATE
export const simulateProjection = async (req, res, next) => {
    try {
        const { scenarioid } = req.params;

        const months =
            Number(req.body.months) || 12;

        const startDate =
            req.body.start_date ||
            new Date().toISOString().split("T")[0];

        const changes = req.body.changes;

        if (months <= 0 || months > 120) {
            throw new Error(
                "Projection months must be between 1 and 120."
            );
        }

        if (!Array.isArray(changes)) {
            throw new Error(
                "Projection changes must be an array."
            );
        }

        const response =
            await scenarioProjectionService.getScenarioProjection({
                userid: req.user.id,
                scenarioid,
                projectionStartDate: startDate,
                months,
                changes
            });

        res.json(response);
    } catch (err) {
        next(err);
    }
};