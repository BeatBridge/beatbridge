import React, { useState, useEffect } from 'react';
import API from '../../api.js';
import './tagsscreen.css';
import defaultAlbumCover from '../../../src/assets/defaultAlbumCover.png'; // Correct path to default image

const TagsScreen = ({ userInfo }) => {
    const [taggedSongs, setTaggedSongs] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchTaggedSongs = async () => {
            try {
                const songs = await API.fetchTaggedSongs();

                // Fetch album images for each song
                const songsWithImages = await Promise.all(songs.map(async (song) => {
                    const searchQuery = `${song.title} ${song.artist}`;
                    const searchResult = await API.searchSongs(searchQuery);

                    // Assume the first result is the correct one
                    const albumImageUrl = searchResult?.tracks?.items?.[0]?.album?.images?.[0]?.url || null;
                    return { ...song, albumImageUrl };
                }));

                setTaggedSongs(songsWithImages);
            } catch (error) {
                console.error('Error fetching tagged songs:', error);
            } finally {
                setLoading(false); // Set loading to false when done
            }
        };

        if (userInfo.id) {
            fetchTaggedSongs();
        }
    }, [userInfo]);

    return (
        <div className="container tags-page-container">
            <div className='row'>
                <div className='col-md-12 sub-screen tags-page-sub-screen'>
                    <h1>Your Tagged Songs</h1>
                    {loading ? ( // Render spinner if loading
                        <div className="spinner"></div>
                    ) : (
                        taggedSongs.length > 0 ? (
                            <ul className="tagged-songs-list">
                                {taggedSongs.map((song) => (
                                    <li key={song.id} className="tagged-song-item">
                                        <div className="song-details">
                                            <div className="album-cover">
                                                <img src={song.albumImageUrl || defaultAlbumCover} alt={`${song.title} album cover`} />
                                            </div>
                                            <h3>{song.title}</h3>
                                            <p><strong>Artist:</strong> {song.artist}</p>
                                            <p><strong>Album:</strong> {song.album}</p>
                                            <p><strong>Genre:</strong> {song.genre}</p>
                                            <p><strong>Mood:</strong> {song.mood}</p>
                                            <p><strong>Tempo:</strong> {song.tempo}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No tagged songs available.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default TagsScreen;
