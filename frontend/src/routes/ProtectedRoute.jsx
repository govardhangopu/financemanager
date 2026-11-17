import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowDemo = true }) => {
    const { token, isDemo } = useAuth();

    if (!token)
        return <Navigate to="/login" replace />;

    if (isDemo && !allowDemo)
        return <Navigate to="/dashboard" replace />;
    
    return children;
}

export default ProtectedRoute;
