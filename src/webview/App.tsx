import * as React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Spotify from "./components/Spotify";
import Logout from "./components/Logout";

const AppContent = () => {
    const { isAuthenticated, isLoading } = useAuth();

    return (
        <div className="app-container">
            {isLoading ? (
                <></>
            ) : isAuthenticated ? (
                <>
                    <Spotify />
                    <Logout />
                </>
            ) : (
                <Login />
            )}
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
