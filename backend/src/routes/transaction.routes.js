import { Router }  from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { addTransaction, getTransactions, updateTransaction, deleteTransaction } from "../controllers/transaction.controller.js";

const router = Router();

router.use(authorizer); //Needs token

router.post('/', addTransaction);
router.get('/', getTransactions);
router.put('/', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;