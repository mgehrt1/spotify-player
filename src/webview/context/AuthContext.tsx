import React, { createContext, useContext, useEffect, useState } from "react";
import MessageContext from "./MessageContext";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
    const { registerHandler } = useContext(MessageContext);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const handleLoginResponse = (message: any) => {
            setIsAuthenticated(message.response);
        };

        registerHandler("loginResponse", handleLoginResponse);
    }, []);

    const login = () => {
        vscode.postMessage({
            command: "login",
        });
    };

    const logout = () => {
        vscode.postMessage({
            command: "logout",
        });
        setIsAuthenticated(false);
    };

    return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
