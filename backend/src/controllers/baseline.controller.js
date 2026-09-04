import * as projectionService from "../services/projection.service.js";

export const getBaseline = async (req, res, next) => {
    try {
        const months = Number(req.query.months) || 12;

        if (months <= 0 || months > 120) {
            throw new Error("Projection months must be between 1 and 120.");
        }

        const response =
            await projectionService.getBaselineProjection(
                req.user.id,
                months
            );

        res.json(response);
    } catch (err) {
        next(err);
    }
};