import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
    const response = await axios.post(`${baseURL}/users/login`, { username, password, });
    return response.data;
};

export const signUp = async (name, email, username, password) => {
    const response = await axios.post(`${baseURL}/users/signup`, { name, email, username, password, });
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