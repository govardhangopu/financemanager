const baseURL = import.meta.env.VITE_API_URL;

import axios from "axios";

const api = axios.create({
    baseURL: `${baseURL}/forecast`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token)
        config.headers.Authorization = `Bearer ${token}`;

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log("Token has expired.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export async function getForecast(months = 12, startDate) {
    const params = { months };

    if (startDate) {
        params.start_date = startDate;
    }

    const res = await api.get("/", { params });

    return res.data;
}