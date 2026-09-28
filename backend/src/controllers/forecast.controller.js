import * as forecastService from "../services/forecast.service.js";

export const getForecast = async (req, res, next) => {
    try {
        const months =
            Number(req.query.months) || 12;

        const startDate =
            req.query.start_date ||
            new Date().toISOString().split("T")[0];

        if (months <= 0 || months > 120) {
            throw new Error(
                "Forecast months must be between 1 and 120."
            );
        }

        const response =
            await forecastService.getForecast({
                userid: req.user.id,
                startDate,
                months
            });

        res.json(response);
    } catch (err) {
        next(err);
    }
};