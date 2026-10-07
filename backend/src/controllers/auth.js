import jwt from "jsonwebtoken";
import {
    getAllUsers,
    signUpService,
    loginService,
    changePasswordService,
    setPasswordService,
    updateProfileService,
    googleLoginService,
    linkGoogleAccountService,
    getAuthStatusService,
    unlinkGoogleService,
    deleteAccountService
} from "../services/user.service.js";
import {
    requestPasswordResetService,
    verifyPasswordResetTokenService,
    resetPasswordService
} from "../services/passwordReset.service.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
};

export const signUp = async (req, res, next) => {
    try {
        const response = await signUpService(req.body);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const googleCallback = async (req, res) => {
    try {
        const result = await googleLoginService(req.user);

        const params = new URLSearchParams({
            token: result.token,
            user: JSON.stringify(result.user)
        });

        res.redirect(
            `${process.env.FRONTEND_URL}/oauth/callback?${params.toString()}`
        );
    } catch (err) {
        console.error(err);

        res.redirect(
            `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
                err.message
            )}`
        );
    }
};

export const startGoogleLink = async (req, res, next) => {
    try {
        const state = jwt.sign(
            {
                userid: req.user.id,
                purpose: "google-link"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10m"
            }
        );

        const googleAuthUrl =
            `${process.env.BACKEND_URL}/users/google/link?state=${encodeURIComponent(state)}`;

        res.json({ url: googleAuthUrl });
    } catch (err) {
        next(err);
    }
};

export const googleLinkCallback = async (req, res) => {
    try {
        const state = jwt.verify(
            req.query.state,
            process.env.JWT_SECRET
        );

        if (state.purpose !== "google-link") {
            throw new Error("Invalid OAuth state.");
        }

        await linkGoogleAccountService(state.userid, req.user);

        res.redirect(
            `${process.env.FRONTEND_URL}/settings`
        );
    } catch (err) {
        console.error(err);

        res.redirect(
            `${process.env.FRONTEND_URL}/settings?googleError=${encodeURIComponent(
                err.message
            )}`
        );
    }
};

export const unlinkGoogle = async (req, res, next) => {
    try {
        const response = await unlinkGoogleService(req.user.id);

        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const getAuthStatus = async (req, res, next) => {
    try {
        const response = await getAuthStatusService(req.user.id);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const response = await loginService(req.body);
        res.json(response);
    } catch (err) {
        next(err);
    }
};

export const setPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const result = await setPasswordService({ userid: req.user.id, newPassword });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        await requestPasswordResetService(email);

        res.json({
            message:
                "If an account exists for this email, a password reset link has been sent."
        });
    } catch (err) {
        next(err);
    }
};

export const verifyPasswordResetToken = async (req, res, next) => {
    try {
        const { token } = req.query;

        const result =
            await verifyPasswordResetTokenService(token);

        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        const result = await resetPasswordService({
            rawToken: token,
            newPassword
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const response = await changePasswordService({
            userid: req.user.id,
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword
        });

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// UPDATE
export const updateProfile = async (req, res, next) => {
    try {
        const response = await updateProfileService(
            req.user.id,
            req.body
        );

        res.json(response);
    } catch (err) {
        next(err);
    }
};

// DELETE
export const deleteAccount = async (req, res, next) => {
    try {
        const response = await deleteAccountService(req.user.id);

        res.json(response);
    } catch (err) {
        next(err);
    }
};