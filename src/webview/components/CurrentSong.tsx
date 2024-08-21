import React, { useContext, useEffect, useState } from "react";
import MessageContext from "../context/MessageContext";

const CurrentSong = () => {
    const { registerHandler } = useContext(MessageContext);
    const [song, setSong] = useState<any>();
    const [artists, setArtists] = useState<any[]>([]);

    useEffect(() => {
        const handleCurrentSong = (message: any) => {
            setSong(message.currentSongInfo);
            setArtists(message.currentSongInfo.artists);
        };

        registerHandler("currentSong", handleCurrentSong);
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
