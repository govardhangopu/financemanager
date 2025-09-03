import { fetchUsers } from "../repositories/user.repo.js";

export const getAllUsers = async () => {
    return await fetchUsers();
};