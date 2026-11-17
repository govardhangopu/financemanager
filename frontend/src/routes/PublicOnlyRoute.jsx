import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute({ children }) {
    const { isDemo } = useAuth();
    return isDemo ? <Navigate to="/dashboard" replace /> : children;
}
