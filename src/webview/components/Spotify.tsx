import React, { useContext, useEffect, useState } from "react";
import Player from "./Player";
import CurrentSong from "./CurrentSong";
import MessageContext from "../context/MessageContext";
import { updatePlayerState } from "./utils/PlayerUtils";

const Spotify = () => {
    const { registerHandler } = useContext(MessageContext);
    const [contentExists, setContentExists] = useState(true);

    useEffect(() => {
        const handleContent = (message: any) => {
            setContentExists(message.response);
        };

        registerHandler("content", handleContent);
    }, []);

    // Update player state every 5 seconds so it always stays synced
    useEffect(() => {
        const interval = setInterval(() => {
            updatePlayerState();
        }, 5000);
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    return contentExists ? (
        <>
            <CurrentSong />
            <Player />
        </>
    ) : (
        <p>No music playing.</p>
    );
};

export default Spotify;
