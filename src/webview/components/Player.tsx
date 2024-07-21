import React, { useState } from "react";
import { ReactSVG } from "react-svg";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

const Player = () => {
    const PLAY = "play";
    const PAUSE = "pause";
    const PREVIOUS = "previous";
    const NEXT = "next";
    const [isPlaying, setIsPlaying] = useState(false);

    const buttonClick = (message: string) => {
        if (isPlaying && message === PAUSE) {
            setIsPlaying(false);
        } else if (!isPlaying && message === PLAY) {
            setIsPlaying(true);
        }
        vscode.postMessage({
            command: message,
        });
    };

    return (
        <div className="controller-container">
            <button className="previous-button" onClick={() => buttonClick(PREVIOUS)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{ transform: "scaleX(-1)" }}>
                    <path d="M19 12l-18 12v-24l18 12zm4-11h-4v22h4v-22z" />
                </svg>
            </button>
            {isPlaying ? (
                <button className="pause-button" onClick={() => buttonClick(PAUSE)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z" />
                    </svg>
                </button>
            ) : (
                <button className="play-button" onClick={() => buttonClick(PLAY)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 22v-20l18 10-18 10z" />
                    </svg>
                </button>
            )}
            <button className="next-button" onClick={() => buttonClick(NEXT)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M19 12l-18 12v-24l18 12zm4-11h-4v22h4v-22z" />
                </svg>
            </button>
        </div>
    );
};

export default Player;
