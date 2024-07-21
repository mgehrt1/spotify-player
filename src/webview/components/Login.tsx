import React from "react";
import { useAuth } from "../context/AuthContext";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

const Login = () => {
    const { login } = useAuth();

    return (
        <div>
            <button onClick={login}>Login</button>
        </div>
    );
};

export default Login;
