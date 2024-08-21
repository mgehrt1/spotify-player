import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { MessageProvider } from "./context/MessageContext";
import "./styles/main.css";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
    <MessageProvider>
        <App />
    </MessageProvider>
);
