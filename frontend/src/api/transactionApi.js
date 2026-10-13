import { createAuthenticatedApi } from "./authenticatedClient";

const api = createAuthenticatedApi(`${import.meta.env.VITE_API_URL}/transactions`);

export async function getTransactions(is_partial = null) {
    const res = await api.get("/", {
        params: {
            is_partial,
        },
    });
    return res.data;
};

export async function addTransaction(data) {
    const res = await api.post('/', data);
    return res.data;
}

export async function updateTransaction(data) {
    const res = await api.put('/', data);
    return res.data;
}

export async function deleteTransaction(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
}