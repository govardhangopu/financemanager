import { createAuthenticatedApi } from "./authenticatedClient";

const api = createAuthenticatedApi(`${import.meta.env.VITE_API_URL}/scenarios`);

// SCENARIO CRUD
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


// SCENARIO CHANGE APIs

// ADD
export async function addScenarioChange(scenarioId, data) {
    const res = await api.post(`/${scenarioId}/changes`, data);
    return res.data;
}

// FETCH
export async function getScenarioChanges(scenarioId) {
    const res = await api.get(`/${scenarioId}/changes`);
    return res.data;
}

// FETCH ONE
export async function getScenarioChangeById(scenarioId, changeId) {
    const res = await api.get(`/${scenarioId}/changes/${changeId}`);
    return res.data;
}

// UPDATE
export async function updateScenarioChange(scenarioId, changeId, data) {
    const res = await api.put(`/${scenarioId}/changes/${changeId}`, data);
    return res.data;
}

// DELETE
export async function deleteScenarioChange(scenarioId, changeId) {
    const res = await api.delete(`/${scenarioId}/changes/${changeId}`);
    return res.data;
}


// SCENARIO PROJECTION API

export async function getScenarioProjection(scenarioId, months = 12, startDate) {
    const params = { months };

    if (startDate) {
        params.start_date = startDate;
    }

    const res = await api.get(`/${scenarioId}/projection`, { params });
    return res.data;
}

export async function getSimulatedScenarioProjection(scenarioId, changes, months = 12, startDate) {
    const res = await api.post(`/${scenarioId}/projection`, { months, start_date: startDate, changes });
    return res.data;
}