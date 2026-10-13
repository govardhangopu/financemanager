import axios from "axios";

export const SESSION_EXPIRY_EVENT = "auth:session-expired";

let sessionExpiryPending = false;

export const resetSessionExpiry = () => {
    sessionExpiryPending = false;
};

export const createAuthenticatedApi = (baseURL) => {
    const api = axios.create({ baseURL });

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
            const authorization =
                error.config?.headers?.get?.("Authorization") ??
                error.config?.headers?.Authorization;
            const requestToken =
                typeof authorization === "string" &&
                authorization.startsWith("Bearer ")
                    ? authorization.slice(7)
                    : null;
            const currentToken = localStorage.getItem("token");

            if (
                error.response?.status === 401 &&
                requestToken &&
                requestToken === currentToken &&
                !sessionExpiryPending
            ) {
                sessionExpiryPending = true;
                window.dispatchEvent(new Event(SESSION_EXPIRY_EVENT));
            }

            return Promise.reject(error);
        }
    );

    return api;
};
