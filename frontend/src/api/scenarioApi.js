const baseURL = import.meta.env.VITE_API_URL;
import axios from "axios";

const api = axios.create({
    baseURL: `${baseURL}/scenarios`,
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
            // Token invalid or expired
            console.log("Token has expired.");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ADD
export async function addScenario(data) {
    const res = await api.post('/', data);
    return res.data;
}

// FETCH
export async function getAllScenarios() {
    const res = await api.get('/');
    return res.data;
}

export async function getScenarioById(id) {
    const res = await api.get(`/${id}`);
    return res.data;
}

// UPDATE
export async function updateScenario(id, data) {
    const res = await api.put(`/${id}`, data);
    return res.data;
}

// DELETE
export async function deleteScenario(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
}


// SCENARIO TRANSACTION APIs

// ADD
export async function addScenarioTransaction(id, data) {
    const res = await api.post(`/${id}/transactions`, data);
    return res.data;
}

// FETCH
export async function getScenarioTransactions(id) {
    const res = await api.get(`/${id}/transactions`);
    return res.data;
}

// UPDATE
export async function updateScenarioTransaction(id, transactionId, data) {
    const res = await api.put(`/${id}/transactions/${transactionId}`, data);
    return res.data;
}

// DELETE
export async function deleteScenarioTransaction(id, transactionId) {
    const res = await api.delete(`/${id}/transactions/${transactionId}`);
    return res.data;
}


// HYPOTHETICAL TRANSACTION APIs

// ADD
export async function addHypotheticalTransaction(scenarioId, data) {
    const res = await api.post(`/${scenarioId}/hypothetical-transactions`, data);
    return res.data;
}

// FETCH
export async function getHypotheticalTransaction(scenarioId, transactionId) {
    const res = await api.get(`/${scenarioId}/hypothetical-transactions/${transactionId}`);
    return res.data;
}

export async function getHypotheticalTransactions(scenarioId) {
    const res = await api.get(`/${scenarioId}/hypothetical-transactions`);
    return res.data;
}

// UPDATE
export async function updateHypotheticalTransaction(scenarioId, transactionId, data) {
    const res = await api.put(`/${scenarioId}/hypothetical-transactions/${transactionId}`, data);
    return res.data;
}

// DELETE
export async function deleteHypotheticalTransaction(scenarioId, transactionId) {
    const res = await api.delete(`/${scenarioId}/hypothetical-transactions/${transactionId}`);
    return res.data;
}