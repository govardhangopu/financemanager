import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import * as scenarioChangeController from "../controllers/scenarioChange.controller.js";

const router = Router();

router.use(authorizer);

router.post("/:scenarioid/changes", scenarioChangeController.create);
router.get("/:scenarioid/changes", scenarioChangeController.fetchAll);
router.get("/:scenarioid/changes/:scenario_changeid", scenarioChangeController.fetchById);
router.put("/:scenarioid/changes/:scenario_changeid", scenarioChangeController.update);
router.delete("/:scenarioid/changes/:scenario_changeid", scenarioChangeController.remove);

export default router;
