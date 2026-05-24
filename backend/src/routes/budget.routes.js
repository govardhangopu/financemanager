import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { addBudget, addCategoryToBudget, addTransactionToBudget, 
        getBudgetById, getAllBudgets, getBudgetTransactions, getBudgetCategories, getBudgetProgress, 
        updateBudget, deleteBudget, deleteCategoryFromBudget, deleteTransactionFromBudget } from "../controllers/budget.controller.js";

const router = Router();

router.use(authorizer); //Needs token
// ADD
router.post('/', addBudget);
router.post('/:budgetid/category/:categoryid', addCategoryToBudget);
router.post('/:budgetid/transaction/:transactionid', addTransactionToBudget);

// FETCH
router.get('/:budgetid', getBudgetById);
router.get('/', getAllBudgets);
router.get('/:budgetid/transactions', getBudgetTransactions);
router.get('/:budgetid/categories', getBudgetCategories);
router.get('/:budgetid/progress', getBudgetProgress);

// UPDATE
router.put('/', updateBudget);

// DELETE
router.delete('/:budgetid', deleteBudget);
router.delete('/:budgetid/category/:categoryid', deleteCategoryFromBudget);
router.delete('/:budgetid/transaction/:transactionid', deleteTransactionFromBudget);

export default router;