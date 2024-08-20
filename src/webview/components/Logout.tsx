import React from "react";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
    const { logout } = useAuth();

    return (
        <button className="vscode-button logout-button" onClick={logout}>
            Logout
        </button>
    );
};

export default Logout;
