import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
    const { logout } = useAuth();

    return <button onClick={logout}>Logout</button>;
};

export default Logout;
