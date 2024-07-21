import * as React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Spotify from "./components/Spotify";

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return <div>{isAuthenticated ? <Spotify /> : <Login />}</div>;
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
