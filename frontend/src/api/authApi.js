import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

export const startGoogleLink = async (token) => {
    const response = await axios.get(
        `${baseURL}/users/google/link/start`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const unlinkGoogle = async (token) => {
    const res = await axios.delete(
        `${baseURL}/users/google/link`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.data;
};

export const getAuthStatus = async (token) => {
    const res = await axios.get(
        `${baseURL}/users/auth/status`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

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

export const setPassword = async (token, newPassword) => {
    const response = await axios.put(
        `${baseURL}/users/password/set`,
        { newPassword },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const changePassword = async (token, currentPassword, newPassword) => {
    const response = await axios.put(
        `${baseURL}/users/password`,
        { currentPassword, newPassword, },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

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
export const updateProfile = async (data, token) => {
    const res = await axios.patch(
        `${baseURL}/users/profile`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.data;
};

// DELETE
export const deleteAccount = async (token) => {
    const res = await axios.delete(
        `${baseURL}/users/account`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.data;
};