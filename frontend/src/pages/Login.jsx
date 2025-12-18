import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"

const baseURL = import.meta.env.VITE_API_URL;

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();
    
    const handleLogin = async () => {
        try {
            const res = await axios.post(`${baseURL}/users/login`, { username, password });
            const { user, token } = res.data.token;
            setUser(user);
            setToken(token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            navigate("/dashboard"); 
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main>
            <div>
                <h1>Login</h1>
                <label htmlFor="username">Enter Username: </label>
                <input type="text" name="username" id="username" 
                    onChange={(e) => setUsername(e.target.value)} required />
                <br />
                <label htmlFor="password">Enter Password: </label>
                <input type="password" name="password" id="password" 
                    onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <input type="submit" value="Login" onClick={handleLogin} />
            </div>
        </main>
    );
}

export default Login;