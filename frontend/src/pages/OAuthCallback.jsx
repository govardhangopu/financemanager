import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");

        if (!token || !userParam) {
            navigate("/login?error=google_auth_failed", { replace: true });
            return;
        }

        try {
            const user = JSON.parse(userParam);

            setUser(user);
            setToken(token);

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error("Google OAuth callback failed:", err);
            navigate("/login?error=google_auth_failed", { replace: true });
        }
    }, [searchParams, navigate, setUser, setToken]);

    return <p>Signing you in...</p>;
};

export default OAuthCallback;