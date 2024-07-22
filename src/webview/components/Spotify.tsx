import React, { useState } from "react";
import Player from "./Player";
import Queue from "./Queue";
import CurrentlyPlaying from "./CurrentSong";
import Devices from "./Devices";

const Spotify = () => {
    const [selectedDevice, setSelectedDevice] = useState(null);

    return (
        <div className="app-container">
            {selectedDevice ? (
                <>
                    <CurrentlyPlaying />
                    <Player />
                    <Queue />
                </>
            ) : (
                <Devices setSelectedDevice={setSelectedDevice} />
            )}
        </div>
    );
};

export default Spotify;
