import React, { useEffect, useState } from "react";

const CurrentSong = () => {
    const [song, setSong] = useState<any>();

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === "currentSong") {
                setSong(message.currentSongInfo);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return (
        <>
            <h2>{song?.name}</h2>
            <img src={song?.album?.images[0].url} alt="Album art" />
        </>
    );
};

export default CurrentSong;
