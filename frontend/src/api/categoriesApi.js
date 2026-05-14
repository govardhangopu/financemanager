const baseURL = import.meta.env.VITE_API_URL;
import axios from "axios";

const api = axios.create({
    baseURL: `${baseURL}/categories`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalid or expired
            console.log("Token has expired.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export async function getCategories(is_partial = null) {
    const res = await api.get("/", {
        params: {
            is_partial,
        },
    });
    return res.data;
};

export async function addCategory(data) {
    const res = await api.post('/', data);
    return res.data;
}

export async function updateCategory(data) {
    const res = await api.put('/', data);
    return res.data;
}

export async function deleteCategory(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
}