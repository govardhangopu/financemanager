import { Router } from 'express';
import { getUsers, signUp, login } from "../controllers/auth.js";

const router = Router();

router.get('/', getUsers);
router.post('/signup', signUp);
router.post('/login', login);

export default router;