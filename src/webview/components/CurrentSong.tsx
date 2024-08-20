import React, { useEffect, useState } from "react";

const CurrentSong = () => {
    const [song, setSong] = useState<any>();
    const [artists, setArtists] = useState<any[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === "currentSong") {
                setSong(message.currentSongInfo);
                setArtists(message.currentSongInfo.artists);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return (
        <>
            <h2 className="song-title">{song?.name}</h2>
            <h3 className="song-artists">{artists?.map((artistInfo) => artistInfo.name)?.join(", ")}</h3>
            <img src={song?.album?.images[0].url} alt="Album art" />
        </>
    );
};

export default CurrentSong;
