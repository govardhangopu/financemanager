import axios from "axios";
import { createAuthenticatedApi } from "./authenticatedClient";

const baseURL = import.meta.env.VITE_API_URL;
const authenticatedApi = createAuthenticatedApi(baseURL);

export const startGoogleLink = async () => {
    const response = await authenticatedApi.get("/users/google/link/start");
    return response.data;
};

export const unlinkGoogle = async () => {
    const res = await authenticatedApi.delete("/users/google/link");
    return res.data;
};

export const getAuthStatus = async () => {
    const res = await authenticatedApi.get("/users/auth/status");
    return res.data;
};

export const login = async (username, password) => {
    const response = await axios.post(`${baseURL}/users/login`, { username, password, });
    return response.data;
};

export const signUp = async (name, email, username, password) => {
    const response = await axios.post(`${baseURL}/users/signup`, { name, email, username, password, });
    return response.data;
};

export const setPassword = async (newPassword) => {
    const response = await authenticatedApi.put("/users/password/set", { newPassword });
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await authenticatedApi.put("/users/password", { currentPassword, newPassword });
    return response.data;
};

export const requestPasswordReset = async (email) => {
    const response = await axios.post(
        `${baseURL}/users/password/forgot`,
        { email }
    );

    return response.data;
};

export const verifyPasswordResetToken = async (token) => {
    const response = await axios.get(
        `${baseURL}/users/password/reset/verify`,
        {
            params: { token }
        }
    );

    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await axios.post(
        `${baseURL}/users/password/reset`,
        {
            token,
            newPassword
        }
    );

    return response.data;
};

//UPDATE
export const updateProfile = async (data) => {
    const res = await authenticatedApi.patch("/users/profile", data);
    return res.data;
};

// DELETE
export const deleteAccount = async () => {
    const res = await authenticatedApi.delete("/users/account");
    return res.data;
};