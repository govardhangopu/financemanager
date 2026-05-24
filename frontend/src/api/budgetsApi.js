const baseURL = import.meta.env.VITE_API_URL;
import axios from "axios";

const api = axios.create({
    baseURL: `${baseURL}/budgets`,
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

// ADD
export async function addBudget(data) {
    const res = await api.post('/', data);
    return res.data;
}

export async function addCategoryToBudget(id, categoryId) {
    const res = await api.post(`/${id}/category`, { categoryId });
    return res.data;
}

export async function addTransactionToBudget(id, transactionId) {
    const res = await api.post(`/${id}/transaction`, { transactionId });
    return res.data;
}

// FETCH
export async function getBudgetById(id) {
    const res = await api.get("/${id}");
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