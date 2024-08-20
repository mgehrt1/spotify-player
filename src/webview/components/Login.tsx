import React from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();

    return (
        <button onClick={login} className="vscode-button">
            Login
        </button>
    );
};

export default Login;
