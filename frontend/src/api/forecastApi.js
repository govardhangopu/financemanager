import { createAuthenticatedApi } from "./authenticatedClient";

const api = createAuthenticatedApi(`${import.meta.env.VITE_API_URL}/forecast`);

export async function getForecast(months = 12, startDate) {
    const params = { months };

    if (startDate) {
        params.start_date = startDate;
    }

    const res = await api.get("/", { params });

    return res.data;
}