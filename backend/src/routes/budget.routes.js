import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { addBudget, addCategoryToBudget, addTransactionToBudget, 
        getBudgetById, getAllBudgets, getBudgetTransactions, getBudgetCategories, getBudgetProgress, 
        updateBudget, deleteBudget, deleteCategoryFromBudget, deleteTransactionFromBudgetS } from "../controllers/budget.controller.js";

const router = Router();

router.use(authorizer); //Needs token
// ADD
router.post('/', addBudget);
router.post('/:id/category', addCategoryToBudget);
router.post('/:id/transaction', addTransactionToBudget);

// FETCH
router.get('/:id', getBudgetById);
router.get('/', getAllBudgets);
router.get('/:id/transactions', getBudgetTransactions);
router.get('/:id/categories', getBudgetCategories);
router.get('/:id/progress', getBudgetProgress);

// UPDATE
router.put('/', updateBudget);

// DELETE
router.delete('/:id', deleteBudget);
router.delete('/:id/category/:categoryid', deleteCategoryFromBudget);
router.delete('/:id/transaction/:transactionid', deleteTransactionFromBudgetS);

export default router;