import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { create, fetchAll, fetchById, update, remove } from "../controllers/scenario.controller.js";
import * as scenarioTransactionController from '../controllers/scenarioTransaction.controller.js';

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
router.get('/:scenarioid', fetchById);
router.get("/:scenarioid/transactions", scenarioTransactionController.fetchAll);
router.get("/:scenarioid/hypothetical-transactions", scenarioTransactionController.fetchAllHypothetical);
router.get("/:scenarioid/hypothetical-transactions/:hypothetical_transactionid", scenarioTransactionController.fetchHypotheticalById);
// UPDATE
router.put("/:scenarioid/transactions/:transactionid", scenarioTransactionController.updateOffset);
router.put("/:scenarioid/hypothetical-transactions/:hypothetical_transactionid", scenarioTransactionController.updateHypothetical);
// DELETE
router.delete("/:scenarioid/transactions/:transactionid", scenarioTransactionController.removeTransaction);
router.delete("/:scenarioid/hypothetical-transactions/:hypothetical_transactionid", scenarioTransactionController.removeHypothetical);
export default router;