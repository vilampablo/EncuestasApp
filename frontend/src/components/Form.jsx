import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";

const DEVELOPER_CODE = "a123"; // Set your desired developer code

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [developerCode, setDeveloperCode] = useState(""); // State for developer code
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        // If registering, check for the correct developer code
        if (method !== "login" && developerCode !== DEVELOPER_CODE) {
            alert("Invalid developer code");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="foroforo-header">
                <h1>ForoForo</h1>
                <h4 className="beta">beta</h4>
            </div>
            <form onSubmit={handleSubmit} className="form-container">
                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username*"
                    required
                />
                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password*"
                    required
                />
                {method !== "login" && (
                    <input
                        className="form-input"
                        type="text"
                        value={developerCode}
                        onChange={(e) => setDeveloperCode(e.target.value)}
                        placeholder="Developer Code*"
                        required
                    />
                )}
                {loading && <LoadingIndicator />}
                <button className="form-button" type="submit">{name}</button>

                {method === "login" ? (
                    <p>
                        Not Registered?{" "}
                        <Link to="/register" className="light-blue-link">
                            Create an account
                        </Link>
                    </p>
                ) : (
                    <p>
                        Have an account already?{" "}
                        <Link to="/login" className="light-blue-link">
                            Log in
                        </Link>
                    </p>
                )}
            </form>
        </>
    );
}

export default Form;
