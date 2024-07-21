import React from "react";
import Player from "./Player";
import Queue from "./Queue";
import CurrentlyPlaying from "./CurrentSong";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

const Spotify = () => {
    return (
        <div className="app-container">
            <CurrentlyPlaying />
            <Player />
            <Queue />
        </div>
    );
};

export default Spotify;
