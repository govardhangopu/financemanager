import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"

const baseURL = import.meta.env.VITE_API_URL;

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    const handleSignUp = async () => {
        axios.post(`${baseURL}/users/signup`, { name, email, username, password })
        .then(res => {
            console.log(res);
            navigate("/login"); 
        })
        .catch((err) => {
            console.error(err);
        })
    }

    return (
        <main>
                <div>
                <h1>Sign Up</h1>
                <label htmlFor="name">Enter Name: </label>
                <input type="text" name="name" id="name" 
                    onChange={(e) => setName(e.target.value)} />
                <br />
                <label htmlFor="email">Enter Email Address: </label>
                <input type="email" name="email" id="email" 
                    onChange={(e) => setEmail(e.target.value)} />
                <br />
                <label htmlFor="username">Enter Username: </label>
                <input type="text" name="username" id="username" 
                    onChange={(e) => setUsername(e.target.value)} required />
                <br />
                <label htmlFor="password">Enter Password: </label>
                <input type="password" name="password" id="password" 
                    onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <input type="submit" value="Sign Up" onClick={handleSignUp} />
            </div>
        </main>
    );
}

export default SignUp;