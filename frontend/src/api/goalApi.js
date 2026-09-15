import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${baseURL}/goals`,
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
            console.log("Token has expired.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export async function getGoals() {
    const res = await api.get("/");
    return res.data;
}

export async function getGoal(goalid) {
    const res = await api.get(`/${goalid}`);
    return res.data;
}

export async function createGoal(goal) {
    const res = await api.post("/", goal);
    return res.data;
}

export async function updateGoal(goalid, goal) {
    const res = await api.put(`/${goalid}`, goal);
    return res.data;
}

export async function deleteGoal(goalid) {
    const res = await api.delete(`/${goalid}`);
    return res.data;
}

export async function getGoalProjection(goalid) {
    const res = await api.get(`/${goalid}/projection`);
    return res.data;
}