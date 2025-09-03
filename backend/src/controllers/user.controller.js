import { getAllUsers } from "../services/user.service.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch(err) {
        next(err);
    }
};