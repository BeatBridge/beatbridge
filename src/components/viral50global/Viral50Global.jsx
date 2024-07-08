import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { FaUser } from 'react-icons/fa';
import './viral50global.css';

const getAllSongs = (resJSON) => {
    let allSongs = [];
    if (!resJSON) return [];

    for (let i = 0; i < resJSON.length; i++) {
        const song = {
            "index": i,
            "name": resJSON[i].track.name,
            "artist": resJSON[i].track.artists ? resJSON[i].track.artists[0].name : "No Artist",
            "images": resJSON[i].track.album.images,
            "duration": resJSON[i].track.duration_ms
        };
        allSongs = [...allSongs, song];
    }
    return allSongs;
};

const TrackCard = ({ track, onClick }) => {
    const formattedIndex = (track.index + 1).toString().padStart(2, '0');
    const formatDuration = (durationMs) => {
        const seconds = Math.floor((durationMs / 1000) % 60);
        const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
        const formattedSeconds = seconds.toString().padStart(2, '0');
        return `${minutes}:${formattedSeconds}`;
    }
    return (
        <div className="viral-50-global-container d-flex align-items-center justify-content-between" onClick={onClick}>
            <div className="viral-50-global-sub-container d-flex flex-grow-1">
                <div className='viral-50-global-info-1 d-flex align-items-center'>
                    <h3>{formattedIndex}</h3>
                    <div className='l-viral-50-global-img-cont'>
                        {track.images && track.images.length > 0 ? (
                            <img src={track.images[0].url} alt="Album Cover" className='l-viral-50-global-img' />
                        ) : (
                            <FaUser className='l-viral-50-global-img' />
                        )}
                    </div>
                </div>
                <div className="viral-50-global-info-2">
                    <h3>{track.name}</h3>
                    <h5>{track.artist}</h5>
                </div>
            </div>

            <div className='tm-duration-play-container d-flex align-items-center'>
                <h4>{formatDuration(track.duration)}</h4>
            </div>

            <div className='tm-wave'>
                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" className="bi bi-soundwave" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5m12 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5"/>
                </svg>
            </div>

            <div className='tm-play-container d-flex align-items-center'>
                <FontAwesomeIcon icon={faCirclePlay} className="tm-play"/>
                <FontAwesomeIcon icon={faPause} className="tm-pause"/>
            </div>
        </div>
    );
};

function Viral50Global({ tracks, onTrackClick }) {
    const allSongs = getAllSongs(tracks);

    return (
        <>
            {allSongs.length > 0 ? (
                allSongs.map((track, index) => (
                    <TrackCard key={index} track={track} onClick={() => onTrackClick(track)} />
                ))
            ) : (
                <p>No tracks available.</p>
            )}
        </>
    );
};

export default Viral50Global;
