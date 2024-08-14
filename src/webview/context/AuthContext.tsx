import React, { createContext, useContext, useEffect, useState } from "react";

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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === "loginResponse") {
                setIsAuthenticated(message.response);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
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
