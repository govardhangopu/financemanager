import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { getForecast } from "../controllers/forecast.controller.js";

const router = Router();

router.use(authorizer);

router.get("/", getForecast);

export default router;