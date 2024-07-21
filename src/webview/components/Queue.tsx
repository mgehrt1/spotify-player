import React, { useEffect, useState } from "react";
import QueueSong from "./QueueSong";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

const Queue = () => {
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === "queue") {
                setQueue(message.queueInfo);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return <div>{queue?.length > 0 ? queue.map((song) => <QueueSong key={song.id} song={song} />) : <p>No songs in the queue</p>}</div>;
};

export default Queue;
