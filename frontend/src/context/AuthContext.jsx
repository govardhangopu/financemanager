import { createContext, useState, useContext, useCallback } from "react";
import { resetSessionExpiry } from "../api/authenticatedClient";
import { clearDemoSession, DEMO_TOKEN, getDemoUser, isDemoSession, startDemoSession } from "../demo/demoStore.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isDemo, setIsDemo] = useState(() => isDemoSession());
    const [token, setTokenState] = useState(() =>
        isDemoSession() ? DEMO_TOKEN : localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        if (isDemoSession()) return getDemoUser();

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
        if (nextToken) {
            clearDemoSession();
            setIsDemo(false);
            resetSessionExpiry();
        }
        setTokenState(nextToken);
    }, []);

    const startDemo = useCallback(() => {
        startDemoSession();
        setIsDemo(true);
        setUser(getDemoUser());
        setTokenState(DEMO_TOKEN);
    }, []);

    const logout = useCallback(() => {
        if (isDemoSession()) {
            clearDemoSession();
            setIsDemo(false);
            const storedToken = localStorage.getItem("token");
            let storedUser = null;
            try {
                storedUser = JSON.parse(localStorage.getItem("user") || "null");
            } catch {
                localStorage.removeItem("user");
            }
            setUser(storedUser);
            setTokenState(storedToken);
            return;
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }, [setToken]);

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, logout, isDemo, startDemo }}>
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
