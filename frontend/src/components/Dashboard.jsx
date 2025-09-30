import { useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";

const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div>
            <button style={{backgroundColor: "lightblue"}} onClick={handleLogout}>Log Out</button>
        </div>
    )
}

export default Dashboard;