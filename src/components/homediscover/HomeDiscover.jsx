import React, { useState, useEffect } from 'react';
import './homediscover.css';
import AboutCard from '../aboutcard/AboutCard';

function HomeDiscover() {
    const [playlists, setPlaylists] = useState([]);
    const [displayedPlaylistsSampler, setDisplayedPlaylistsSampler] = useState([]);

    useEffect(() => {
        const fetchTopPlaylists = async () => {
            try {
                const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
                const response = await fetch(`${backendUrlAccess}/user/public-top-playlists`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const playlistsData = await response.json();
                if (!Array.isArray(playlistsData)) {
                    throw new Error('Expected an array of playlists');
                }
                setPlaylists(playlistsData);
                setDisplayedPlaylistsSampler(playlistsData.slice(0, 1));
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        };

        fetchTopPlaylists();
    }, []);

    return (
        <div className='about-container'>
            <div className='about-title'>
                <h2>Discover new music at your fingertips!</h2>
            </div>

            <div className="about-card-container-1">
                {playlists.map(playlist => (
                    <AboutCard
                        key={playlist.id}
                        name={playlist.name}
                        description={playlist.description}
                        image={playlist.images[0] ? playlist.images[0].url : null}
                    />
                ))}
            </div>
            <div className="about-card-container-2">
                {displayedPlaylistsSampler.map(playlist => (
                    <AboutCard
                        key={playlist.id}
                        name={playlist.name}
                        description={playlist.description}
                        image={playlist.images[0] ? playlist.images[0].url : null}
                    />
                ))}
            </div>
        </div>
    )
}

export default HomeDiscover;
