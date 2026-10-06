import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    fetchUsers,
    findUser,
    createUser,
    findUserById,
    updatePassword,
    updateUser,
    findUserByEmail,
    createOAuthAccount,
    findOAuthAccount,
    findOAuthAccountByUserId,
    deleteUser,
    unlinkGoogleAccount
} from "../repositories/user.repo.js";
import { validatePassword } from "../utils/password.utils.js";

const createAuthResponse = (user, authProvider = "password") => {
    const token = jwt.sign(
        {
            id: user.userid
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        token,
        user: {
            username: user.username,
            email: user.email,
            name: user.name,
            authProvider
        }
    };
};

export const getAllUsers = async () => {
    return await fetchUsers();
};

export const signUpService = async ({ name, email, username, password }) => {
    const existingUser = await findUser({ username });
    if (existingUser[0]) {
        throw new Error("Username already exists.");
    }

    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
        throw new Error("An account with this email already exists.");
    }

    validatePassword(password);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return createUser({ name, email, username, password: hashedPassword });
};

const generateGoogleUsername = async (name, email) => {
    const emailUsername = email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "")
        .slice(0, 40);

    let username = emailUsername || "user";
    let counter = 1;

    while (true) {
        const existingUser = await findUser({ username });

        if (!existingUser[0]) {
            return username;
        }

        const suffix = `_${counter}`;

        username =
            `${emailUsername.slice(0, 45 - suffix.length)}${suffix}`;

        counter++;
    }
};

export const googleLoginService = async (googleUser) => {
    const { googleId, email, name } = googleUser;

    if (!googleId || !email) {
        throw new Error("Google account information is incomplete.");
    }

    // Google account already linked
    const existingOAuthAccount = await findOAuthAccount(googleId);

    if (existingOAuthAccount) {
        const user = await findUserById(existingOAuthAccount.userid);

        if (!user) {
            throw new Error("Linked user account was not found.");
        }

        return createAuthResponse(user, "google");
    }

    // Email already belongs to an existing account
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new Error(
            "An account with this email already exists. Log in with your existing account first, then connect Google from Settings."
        );
    }

    // Create a unique username
    const username = await generateGoogleUsername(name, email);

    // Create OAuth-only user
    const userid = await createUser({
        name,
        email,
        username,
        password: null
    });

    // Link Google account
    await createOAuthAccount({
        userid,
        providerUserId: googleId,
        providerEmail: email
    });

    // Fetch the actual user
    const user = await findUserById(userid);

    return createAuthResponse(user, "google");
};

export const linkGoogleAccountService = async (userid, googleUser) => {
    const { googleId, email } = googleUser;

    if (!googleId || !email) {
        throw new Error("Google account information is incomplete.");
    }

    // 1. Make sure the current Finance Manager user exists
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    // 2. Check whether this Google account is already linked
    const existingOAuthAccount = await findOAuthAccount(googleId);

    if (existingOAuthAccount) {
        // Already linked to this same user
        if (existingOAuthAccount.userid === userid) {
            throw new Error("This Google account is already linked.");
        }

        // Linked to somebody else
        throw new Error(
            "This Google account is already linked to another account."
        );
    }

    // 3. Check whether this Finance Manager account already has Google linked
    const existingUserOAuthAccount = await findOAuthAccountByUserId(userid);

    if (existingUserOAuthAccount) {
        throw new Error(
            "A Google account is already linked to this account."
        );
    }

    // 4. Link Google to the existing user
    await createOAuthAccount({
        userid,
        providerUserId: googleId,
        providerEmail: email
    });

    return {
        message: "Google account linked successfully."
    };
};

export const unlinkGoogleService = async (userid) => {
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    if (!user.password) {
        throw new Error(
            "You must set a password before disconnecting your Google account."
        );
    }

    await unlinkGoogleAccount(userid);

    return {
        message: "Google account disconnected successfully."
    };
};

export const getGoogleStatusService = async (userid) => {
    const oauthAccount = await findOAuthAccountByUserId(userid);

    if (!oauthAccount) {
        return {
            connected: false
        };
    }

    return {
        connected: true,
        email: oauthAccount.provider_email
    };
};

export const loginService = async ({ username, password }) => {
    const user = await findUser({ username });
    if (!user[0]) throw new Error("Username not found.");

    // Google-only account
    if (!user[0].password) {
        throw new Error("This account uses Google sign-in. Please continue with Google.");
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) throw new Error("Incorrect password.");
    return createAuthResponse(user[0], "password");
};

export const setPasswordService = async ({ userid, newPassword }) => {
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    if (user.password) {
        throw new Error(
            "A password is already set for this account."
        );
    }

    validatePassword(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(userid, hashedPassword);

    return {
        message: "Password set successfully."
    };
};

export const changePasswordService = async ({ userid, currentPassword, newPassword }) => {
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    // Google-only account
    if (!user.password) {
        throw new Error("This account uses Google sign-in. Password changes are not available.");
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
        throw new Error("Current password is incorrect.");
    }

    if (currentPassword === newPassword) {
        throw new Error("New password must be different from your current password.");
    }

    validatePassword(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(userid, hashedPassword);

    return { message: "Password changed successfully." };
};

// UPDATE
export const updateProfileService = async (userid, { name, username, email }) => {
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    const existingUser = await findUser({ username });

    if (existingUser[0] && existingUser[0].userid !== userid) {
        throw new Error("Username already exists.");
    }

    const oauthAccount = await findOAuthAccountByUserId(userid);

    if (oauthAccount && email !== user.email) {
        throw new Error("Email cannot be changed for Google accounts.");
    }

    const updatedUser = await updateUser({ userid, name, username, email });

    return {
        user: {
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            authProvider: oauthAccount ? "google" : "password"
        }
    };
};

// DELETE
export const deleteAccountService = async (userid) => {
    const user = await findUserById(userid);

    if (!user) {
        throw new Error("User not found.");
    }

    await deleteUser(userid);

    return {
        message: "Account deleted successfully."
    };
};