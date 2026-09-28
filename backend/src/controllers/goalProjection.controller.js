import * as goalProjectionService from "../services/goalProjection.service.js";

export const getGoalProjection = async (req, res, next) => {
    try {
        const projection =
            await goalProjectionService.getGoalProjection({
                userid: req.user.id,
                goalid: req.params.goalid
            });

        res.json(projection);
    } catch (err) {
        next(err);
    }
};