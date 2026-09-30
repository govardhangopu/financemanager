import { getAllUsers, signUpService, loginService, changePasswordService } from "../services/user.service.js";

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

export const login = async (req, res, next) => {
    try {
        const token = await loginService(req.body);
        res.json({ token });
    } catch (err) {
        next(err);
    }
}

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