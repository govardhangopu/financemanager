import { createAuthenticatedApi } from "./authenticatedClient";

const api = createAuthenticatedApi(`${import.meta.env.VITE_API_URL}/categories`);

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