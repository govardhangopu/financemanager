import { createAuthenticatedApi } from "./authenticatedClient";

const api = createAuthenticatedApi(`${import.meta.env.VITE_API_URL}/budgets`);

export async function addBudget(data) {
    const res = await api.post('/', data);
    return res.data;
}

export async function addCategoryToBudget(id, categoryId) {
    const res = await api.post(`/${id}/category/${categoryId}`);
    return res.data;
}

export async function addTransactionToBudget(id, transactionId) {
    const res = await api.post(`/${id}/transaction/${transactionId}`);
    return res.data;
}

// FETCH
export async function getBudgetById(id) {
    const res = await api.get(`/${id}`);
    return res.data;
}

export async function getAllBudgets() {
    const res = await api.get('/');
    return res.data;
}

export async function getBudgetTransactions(id) {
    const res = await api.get(`/${id}/transactions`);
    return res.data;
}

export async function getBudgetCategories(id) {
    const res = await api.get(`/${id}/categories`);
    return res.data;
}

export async function getBudgetProgress(id) {
    const res = await api.get(`/${id}/progress`);
    return res.data;
}

// UPDATE
export async function updateBudget(data) {
    const res = await api.put('/', data);
    return res.data;
}

// DELETE
export async function deleteBudget(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
}

export async function deleteCategoryFromBudget(id, categoryId) {
    const res = await api.delete(`/${id}/category/${categoryId}`);
    return res.data;
}

export async function deleteTransactionFromBudget(id, transactionId) {
    const res = await api.delete(`/${id}/transaction/${transactionId}`);
    return res.data;
}