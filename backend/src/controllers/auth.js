import {
    getAllUsers,
    signUpService,
    loginService,
    changePasswordService,
    updateProfileService,
    googleLoginService,
    deleteAccountService
} from "../services/user.service.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch(err) {
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

export const login = async (req, res, next) => {
    try {
        const response = await loginService(req.body);
        res.json(response);
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