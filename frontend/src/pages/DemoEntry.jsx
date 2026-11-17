import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function DemoEntry() {
    const { startDemo } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        startDemo();
        navigate("/dashboard", { replace: true });
    }, [startDemo, navigate]);

    return <Loader fullscreen text="Preparing your demo..." />;
}
