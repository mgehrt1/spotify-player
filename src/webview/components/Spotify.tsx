import React from "react";
import Player from "./Player";
import CurrentSong from "./CurrentSong";

const Spotify = () => {
    return (
        <div className="app-container">
            <CurrentSong />
            <Player />
        </div>
    );
};

export default Spotify;
