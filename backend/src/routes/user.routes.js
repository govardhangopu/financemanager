import { Router } from 'express';
import {
    getUsers,
    signUp,
    login,
    changePassword,
    setPassword,
    requestPasswordReset,
    verifyPasswordResetToken,
    resetPassword,
    updateProfile,
    googleCallback,
    startGoogleLink,
    googleLinkCallback,
    getAuthStatus,
    unlinkGoogle,
    deleteAccount
} from "../controllers/auth.js";
import { authorizer } from "../middlewares/authMiddleware.js";
import passport from "../../config/passport.js";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google-login", {
        scope: ["profile", "email"]
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google-login", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
    }),
    googleCallback
);

router.get("/auth/status", authorizer, getAuthStatus);

router.get("/google/link/start", authorizer, startGoogleLink);

router.get(
    "/google/link",
    (req, res, next) => {
        passport.authenticate("google-link", {
            scope: ["profile", "email"],
            state: req.query.state
        })(req, res, next);
    }
);

router.get(
    "/google/link/callback",
    passport.authenticate("google-link", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/settings`
    }),
    googleLinkCallback
);

router.delete("/google/link", authorizer, unlinkGoogle);

router.get('/', getUsers);
router.post('/signup', signUp);
router.post('/login', login);
router.put('/password', authorizer, changePassword);
router.put("/password/set", authorizer, setPassword);
router.post("/password/forgot", requestPasswordReset);
router.get("/password/reset/verify", verifyPasswordResetToken);
router.post("/password/reset", resetPassword);
router.patch('/profile', authorizer, updateProfile);
router.delete("/account", authorizer, deleteAccount);

export default router;