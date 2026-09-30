import bcrypt from 'bcryptjs';
import { fetchUsers, findUser, createUser, findUserById, updatePassword } from "../repositories/user.repo.js";
import jwt from 'jsonwebtoken';

export const getAllUsers = async () => {
    return await fetchUsers();
};

export const signUpService = async ({ name, email, username, password }) => {
    const existingUser = await findUser({ username });
    if (existingUser[0]) {
        throw new Error("Username already exists.");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return createUser({ name, email, username, password: hashedPassword });
};

export const loginService = async ({ username, password }) => {
    const user = await findUser({ username });
    if (!user[0]) throw new Error("Username not found.");

    const { name, email } = user[0];
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) throw new Error("Incorrect password.");
    const token = jwt.sign(
        { id: user[0].userid, username: user[0].username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    return { token, user: { username, email, name } };
}

export const changePasswordService = async ({ userid, currentPassword, newPassword }) => {
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
        throw new Error("Current password is incorrect.");
    }

    if (currentPassword === newPassword) {
        throw new Error("New password must be different from your current password.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(userid, hashedPassword);

    return { message: "Password changed successfully." };
};