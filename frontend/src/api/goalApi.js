import { createAuthenticatedApi } from "./authenticatedClient";

const api = createAuthenticatedApi(`${import.meta.env.VITE_API_URL}/goals`);

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