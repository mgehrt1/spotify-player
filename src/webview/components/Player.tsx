import React, { useContext, useEffect, useRef, useState } from "react";
import MessageContext from "../context/MessageContext";

interface vscode {
    postMessage(message: any): void;
}
declare const vscode: vscode;

const Player = () => {
    const PLAY = "play";
    const PAUSE = "pause";
    const PREVIOUS = "previous";
    const NEXT = "next";

    const { registerHandler } = useContext(MessageContext);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [currentTrackDuration, setCurrentTrackDuration] = useState<number>(0);
    const [currentTrackProgress, setCurrentTrackProgress] = useState<number>(0);

    const previousClickRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const refreshRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        refreshRef.current = setTimeout(() => {
            updatePlayerState();
        }, 5000);
    }, []);

    useEffect(() => {
        const handleTime = (message: any) => {
            setCurrentTrackDuration(message.timeInfo.item.duration_ms);
            setCurrentTrackProgress(message.timeInfo.progress_ms);
        };

        registerHandler("time", handleTime);
    }, []);

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

    const handlePreviousClick = () => {
        const now = Date.now();
        const doubleClickThreshold = 2000;

        if (previousClickRef.current && now - previousClickRef.current < doubleClickThreshold) {
            vscode.postMessage({ command: PREVIOUS });
        } else {
            vscode.postMessage({ command: "seek", newProgress: 0 });
        }

        previousClickRef.current = now;
    };

    const updatePlayerState = () => {
        vscode.postMessage({
            command: "updatePlayer",
        });
    };

    const trackSongEnd = () => {
        const timeRemaining = currentTrackDuration - currentTrackProgress;
        if (timeRemaining > 0) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                updatePlayerState();
            }, timeRemaining);
        }
    };

    useEffect(() => {
        if (isPlaying && currentTrackDuration > 0) {
            trackSongEnd();
        }
    }, [isPlaying, currentTrackDuration, currentTrackProgress]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTrackProgress((prevProgress) => {
                    const newProgress = prevProgress + 1000; // Increment by 1 second
                    if (newProgress >= currentTrackDuration) {
                        clearInterval(interval);
                        return currentTrackDuration; // Cap at the track duration
                    }
                    return newProgress;
                });
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPlaying, currentTrackDuration]);

    // Update player state every 5 seconds so it always stays synced
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("HERE");
            updatePlayerState();
        }, 5000);
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    const progressPercentage = (currentTrackProgress / currentTrackDuration) * 100;

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.clientWidth;
        const newProgress = Math.floor((clickPosition / progressBarWidth) * currentTrackDuration);

        vscode.postMessage({
            command: "seek",
            newProgress: newProgress,
        });
    };

    return (
        <div className="controller-container">
            <div className="progress-bar-container" onClick={handleProgressClick}>
                <div
                    className="progress-bar"
                    style={{
                        width: `${progressPercentage}%`,
                        height: "100%",
                        background: "#1db954", // Spotify green
                        transition: "width 0.1s linear",
                    }}
                ></div>
            </div>
            <div className="player-controls">
                <button className="icon-button flipped-x" onClick={handlePreviousClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 12l-18 12v-24l18 12zm4-11h-4v22h4v-22z" />
                    </svg>
                </button>
                {isPlaying ? (
                    <button className="icon-button" onClick={() => buttonClick(PAUSE)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z" />
                        </svg>
                    </button>
                ) : (
                    <button className="icon-button" onClick={() => buttonClick(PLAY)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M3 22v-20l18 10-18 10z" />
                        </svg>
                    </button>
                )}
                <button className="icon-button" onClick={() => buttonClick(NEXT)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 12l-18 12v-24l18 12zm4-11h-4v22h4v-22z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Player;
