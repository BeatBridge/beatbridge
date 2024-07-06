import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import { NavLink } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import './map.css';

function Map () {
    const [playlists, setPlaylists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [detailedTracks, setDetailedTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedPlaylists = async () => {
            const result = await API.getFeaturedPlaylists();
            if (result.error) {
                setError(result.error);
            } else {
                setPlaylists(result.playlists.items);
            }
        };

        fetchFeaturedPlaylists();
    }, []);

    const fetchPlaylistTracks = async (playlistId) => {
        const result = await API.getPlaylistTracks(playlistId);
        if (result.error) {
            setError(result.error);
        } else {
            setTracks(result.items);

            // Fetch detailed information for each track
            const trackIds = result.items.map(item => item.track.id);
            const trackDetailsResult = await API.getTrackDetails(trackIds);
            if (trackDetailsResult.error) {
                setError(trackDetailsResult.error);
            } else {
                setDetailedTracks(trackDetailsResult.tracks);
            }
        }
    };

    return (
        <div className="container">
            <div className='row'>
                <div className='col-md-2'>
                    <NavLink to="/" className="auth-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='auth-logo-container'>
                                <img src={logoImg} alt="logo" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-12'>
                    <h1>Featured Playlists</h1>
                    {error && <p>{error}</p>}
                    {!error && (
                        <ul>
                            {playlists.map(playlist => (
                                <li key={playlist.id}>
                                    <button onClick={() => fetchPlaylistTracks(playlist.id)}>{playlist.name}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className='row'>
                <div className='col-md-12'>
                    <h2>Tracks</h2>
                    {detailedTracks.length > 0 ? (
                        <ul>
                            {detailedTracks.map((track, index) => (
                                <li key={index}>
                                    {track.name} by {track.artists.map(artist => artist.name).join(', ')}
                                    <p>Album: {track.album.name}</p>
                                    <p>Duration: {track.duration_ms} ms</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Select a playlist to view its tracks.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Map;
