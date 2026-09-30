import { Router } from 'express';
import { getUsers, signUp, login, changePassword } from "../controllers/auth.js";
import { authorizer } from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/', getUsers);
router.post('/signup', signUp);
router.post('/login', login);
router.put('/password', authorizer, changePassword);

export default router;