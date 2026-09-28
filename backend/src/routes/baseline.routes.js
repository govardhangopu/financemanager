import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { getBaseline } from "../controllers/baseline.controller.js";

const router = Router();

router.use(authorizer);

router.get("/", getBaseline);

export default router;