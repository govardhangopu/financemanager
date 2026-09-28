import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { create, fetchAll, fetchById, update, remove } from "../controllers/goal.controller.js";
import { getGoalProjection } from "../controllers/goalProjection.controller.js";

const router = Router();
router.use(authorizer);

// ADD
router.post("/", create);

// FETCH
router.get("/", fetchAll);
router.get("/:goalid/projection", getGoalProjection);
router.get("/:goalid", fetchById);

// UPDATE
router.put("/:goalid", update);

// DELETE
router.delete("/:goalid", remove);

export default router;