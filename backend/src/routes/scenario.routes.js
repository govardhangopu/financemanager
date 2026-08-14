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
// FETCH
router.get("/:scenarioid/transactions", scenarioTransactionController.fetchAll);
// UPDATE
router.put("/:scenarioid/transactions/:transactionid", scenarioTransactionController.updateOffset);
// DELETE
router.delete("/:scenarioid/transactions/:transactionid", scenarioTransactionController.removeTransaction);
export default router;