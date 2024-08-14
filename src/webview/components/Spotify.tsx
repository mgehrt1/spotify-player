import React from "react";
import Player from "./Player";
import CurrentlyPlaying from "./CurrentSong";

const Spotify = () => {
    return (
        <div className="app-container">
            <CurrentlyPlaying />
            <Player />
        </div>
    );
};

export default Spotify;
