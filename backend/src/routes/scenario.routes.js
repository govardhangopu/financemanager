import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { create, fetchAll, fetchById, update, remove } from "../controllers/scenario.controller.js";
import * as scenarioTransactionController from '../controllers/scenarioTransaction.controller.js';
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

// Scenario Transaction ROUTES
// ADD
router.post("/:scenarioid/transactions", scenarioTransactionController.addTransaction);
router.post("/:scenarioid/hypothetical-transactions", scenarioTransactionController.addHypothetical);
// FETCH
router.get("/:scenarioid/transactions", scenarioTransactionController.fetchAll);
router.get('/:scenarioid/simulated-transactions', scenarioTransactionController.fetchSimulatedTransactions);
router.get("/:scenarioid/hypothetical-transactions", scenarioTransactionController.fetchAllHypothetical);
router.get("/:scenarioid/hypothetical-transactions/:hypothetical_transactionid", scenarioTransactionController.fetchHypotheticalById);
router.get("/:scenarioid/summary", scenarioTransactionController.getSummary);
// UPDATE
router.put("/:scenarioid/transactions/:transactionid", scenarioTransactionController.updateOffset);
router.put("/:scenarioid/hypothetical-transactions/:hypothetical_transactionid", scenarioTransactionController.updateHypothetical);
// DELETE
router.delete("/:scenarioid/transactions/:transactionid", scenarioTransactionController.removeTransaction);
router.delete("/:scenarioid/hypothetical-transactions/:hypothetical_transactionid", scenarioTransactionController.removeHypothetical);
export default router;

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