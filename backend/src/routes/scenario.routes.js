import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { create, fetchAll, fetchById, update, remove } from "../controllers/scenario.controller.js";
import * as scenarioChangeController from "../controllers/scenarioChange.controller.js";
import * as scenarioProjectionController from "../controllers/scenarioProjection.controller.js";

const router = Router();

router.use(authorizer);
// ADD
router.post('/', create);
// FETCH
router.get('/', fetchAll);
router.get('/:scenarioid', fetchById);
// UPDATE
router.put('/:scenarioid', update);
// DELETE
router.delete('/:scenarioid', remove);

// Scenario Change ROUTES
// ADD
router.post("/:scenarioid/changes", scenarioChangeController.create);
// FETCH
router.get("/:scenarioid/changes", scenarioChangeController.fetchAll);
router.get("/:scenarioid/changes/:scenario_changeid", scenarioChangeController.fetchById);
// UPDATE
router.put("/:scenarioid/changes/:scenario_changeid", scenarioChangeController.update);
// DELETE
router.delete("/:scenarioid/changes/:scenario_changeid", scenarioChangeController.remove);

// Scenario Projection ROUTES
// ADD
router.post("/:scenarioid/projection", scenarioProjectionController.simulateProjection);
// FETCH
router.get("/:scenarioid/projection", scenarioProjectionController.getProjection);

export default router;