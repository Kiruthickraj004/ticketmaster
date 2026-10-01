import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

function Login() {

    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        try {
        const data = await loginUser(username, password);

        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        navigate("/");
        } catch (error) {
        console.error(error);

        setError(
            error.response?.data?.detail ||
            "Invalid username or password."
        );
        }
    };

    return (
        <div>
        <h1>Login</h1>

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            />

            <br />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            />

            <br />

            <button type="submit">
            Login
            </button>
        </form>
        </div>
    );
}

export default Login;