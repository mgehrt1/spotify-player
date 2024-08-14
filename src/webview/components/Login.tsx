import React from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();

    return <button onClick={login}>Login</button>;
};

export default Login;
