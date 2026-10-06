import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "./email.service.js";
import { validatePassword } from "../utils/password.utils.js";
import { findUserByEmail, findUserById, updatePassword } from "../repositories/user.repo.js";
import {
    createPasswordResetToken,
    findPasswordResetToken,
    invalidateUserPasswordResetTokens,
    markPasswordResetTokenUsed
} from "../repositories/passwordReset.repo.js";

const getValidPasswordResetToken = async (rawToken) => {
    const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const resetToken = await findPasswordResetToken(tokenHash);

    if (!resetToken) {
        throw new Error("Invalid or expired password reset link.");
    }

    if (resetToken.used_at) {
        throw new Error("Invalid or expired password reset link.");
    }

    if (new Date(resetToken.expires_at) <= new Date()) {
        throw new Error("Invalid or expired password reset link.");
    }

    return resetToken;
};


export const requestPasswordResetService = async (email) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return;
    }

    await invalidateUserPasswordResetTokens(user.userid);

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await createPasswordResetToken({
        userid: user.userid,
        tokenHash,
        expiresAt
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendEmail({
        to: user.email,
        subject: "Reset your Finance Manager password",
        html: `
            <h2>Reset your password</h2>

            <p>
                We received a request to reset your Finance Manager password.
            </p>

            <p>
                <a href="${resetUrl}">
                    Reset your password
                </a>
            </p>

            <p>
                This link will expire in 1 hour.
            </p>

            <p>
                If you did not request this, you can safely ignore this email.
            </p>
        `
    });
};

export const verifyPasswordResetTokenService = async (rawToken) => {
    await getValidPasswordResetToken(rawToken);

    return {
        valid: true
    };
};

export const resetPasswordService = async ({ rawToken, newPassword }) => {
    const resetToken = await getValidPasswordResetToken(rawToken);

    const user = await findUserById(resetToken.userid);

    if (!user) {
        throw new Error("User not found.");
    }

    validatePassword(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updatePassword(resetToken.userid, hashedPassword);

    await markPasswordResetTokenUsed(resetToken.id);

    return {
        message: "Password reset successfully."
    };
};