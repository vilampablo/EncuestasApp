import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";

const DEVELOPER_CODE = "a123"; // Set your desired developer code

function Form({ route, method, reference }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [developerCode, setDeveloperCode] = useState(""); // State for developer code
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : method === "loginByForm" ? "Log In" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        if (method !== "login" && method !== "loginByForm" && developerCode !== DEVELOPER_CODE) {
            alert("Invalid developer code");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post(route, { email, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else if (method === "loginByForm") {
                navigate(`/sharedForm/${reference}`);
            } else{
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email*"
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
                {method !== "login" && method !== "loginByForm" && (
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

                {method === "login" || method === "loginByForm" ? (
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
