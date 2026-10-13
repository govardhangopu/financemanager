import { createContext, useState, useContext, useCallback } from "react";
import { resetSessionExpiry } from "../api/authenticatedClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(() =>
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) return null;

        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const setToken = useCallback((nextToken) => {
        if (nextToken) resetSessionExpiry();
        setTokenState(nextToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }, [setToken]);

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Makes the current user's context available in the page.
 * @example
 * import { useAuth }  from "../context/AuthContext";
 * 
 * const Page = () => {
    const { user } = useAuth(); 
}
 */
export const useAuth = () => {
    return useContext(AuthContext);
};