export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
    }
};