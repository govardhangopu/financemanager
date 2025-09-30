import { Router }  from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { addCategory, getCategories, updateCategory, deleteCategory } from "../controllers/categories.controller.js";

const router = Router();

router.use(authorizer); //Needs token

router.post('/', addCategory);
router.get('/', getCategories);
router.put('/', updateCategory);
router.delete('/:id', deleteCategory);

export default router;