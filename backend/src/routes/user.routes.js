import { Router } from 'express';
import { getUsers, signUp, login, changePassword, updateProfile, googleCallback, deleteAccount } from "../controllers/auth.js";
import { authorizer } from "../middlewares/authMiddleware.js";
import passport from "../../config/passport.js";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
    }),
    googleCallback
);

router.get('/', getUsers);
router.post('/signup', signUp);
router.post('/login', login);
router.put('/password', authorizer, changePassword);
router.patch('/profile', authorizer, updateProfile);
router.delete("/account", authorizer, deleteAccount);

export default router;