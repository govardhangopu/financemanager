import { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

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