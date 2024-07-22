import { useEffect } from "react";

type Message = {
    command: string;
    [key: string]: any;
};

type Callback = (message: Message) => void;

const subscribers: Callback[] = [];

const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    subscribers.forEach((callback) => callback(message));
};

const useMessageListener = () => {
    useEffect(() => {
        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);
};

export const useMessageSubscription = (callback: Callback) => {
    useMessageListener();

    useEffect(() => {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }, [callback]);
};
