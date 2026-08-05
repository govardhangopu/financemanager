import { Router } from "express";
import { authorizer } from "../middlewares/authMiddleware.js";
import { create, fetchAll, fetchById, update, remove } from "../controllers/scenario.controller.js";

const router = Router();

router.use(authorizer);
// ADD
router.post('/', create);
// FETCH
router.get('/', fetchAll);
router.get('/:scenarioid', fetchById);
// UPDATE
router.put('/"scenarioid', update);
// DELETE
router.delete('/:scenarioid', remove);

export default router;