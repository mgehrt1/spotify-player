import React, { useContext, useEffect, useRef, useState } from "react";
import MessageContext from "../context/MessageContext";

const CurrentSong = () => {
    const { registerHandler } = useContext(MessageContext);
    const [song, setSong] = useState<any>();
    const [artists, setArtists] = useState<any[]>([]);

    const titleRef = useRef<HTMLDivElement>(null);
    const artistsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleCurrentSong = (message: any) => {
            setSong(message.currentSongInfo);
            setArtists(message.currentSongInfo.artists);
        };

        registerHandler("currentSong", handleCurrentSong);
    }, []);

    const updateScrollDistance = () => {
        if (titleRef.current) {
            const containerWidth = titleRef.current.parentElement!.offsetWidth;
            const textWidth = titleRef.current.scrollWidth;
            const scrollDistance = textWidth - containerWidth > 0 ? containerWidth - textWidth : 0;
            titleRef.current.style.setProperty("--scroll-distance", `${scrollDistance}px`);

            // Reset the animation by triggering a reflow
            titleRef.current.style.animation = "none";
            titleRef.current.offsetHeight;
            titleRef.current.style.animation = "";
        }

        if (artistsRef.current) {
            const containerWidth = artistsRef.current.parentElement!.offsetWidth;
            const textWidth = artistsRef.current.scrollWidth;
            const scrollDistance = textWidth - containerWidth > 0 ? containerWidth - textWidth : 0;
            artistsRef.current.style.setProperty("--scroll-distance", `${scrollDistance}px`);

            // Reset the animation by triggering a reflow
            artistsRef.current.style.animation = "none";
            artistsRef.current.offsetHeight;
            artistsRef.current.style.animation = "";
        }
    };

    useEffect(() => {
        updateScrollDistance();

        window.addEventListener("resize", updateScrollDistance);

        return () => window.removeEventListener("resize", updateScrollDistance);
    }, [song, artists]);

    return (
        <div className="current-song">
            <div className="scrolling-container">
                <div className="scrolling-text song-title" ref={titleRef}>
                    <h2>{song?.name}</h2>
                </div>
            </div>
            <div className="scrolling-container">
                <div className="scrolling-text song-artists" ref={artistsRef}>
                    <h4>{artists?.map((artistInfo) => artistInfo.name)?.join(", ")}</h4>
                </div>
            </div>
            <img className="album-art" src={song?.album?.images[0].url} alt="Album art" />
        </div>
    );
};

export default CurrentSong;
