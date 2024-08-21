import React, { createContext, useState, useEffect } from "react";

interface MessageContextType {
    registerHandler: (command: string, handler: (message: any) => void) => void;
}

const MessageContext = createContext<MessageContextType>({
    registerHandler: () => {},
});

export const MessageProvider = ({ children }) => {
    const [handlers, setHandlers] = useState<{ [key: string]: ((message: any) => void)[] }>({});

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (handlers[message.command]) {
                handlers[message.command].forEach((handler) => handler(message));
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [handlers]);

    const registerHandler = (command: string, handler: (message: any) => void) => {
        setHandlers((prev) => ({
            ...prev,
            [command]: [...(prev[command] || []), handler],
        }));
    };

    return <MessageContext.Provider value={{ registerHandler }}>{children}</MessageContext.Provider>;
};

export default MessageContext;
