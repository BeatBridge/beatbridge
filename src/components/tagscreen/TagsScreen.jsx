import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import API from '../../api.js';
import CustomModal from '../custommodal/CustomModal';
import EditTagsModal from '../custommodal/EditTagsModal';
import './tagsscreen.css';
import defaultAlbumCover from '../../../src/assets/defaultAlbumCover.png';

const TagsScreen = ({ userInfo }) => {
    const [taggedSongs, setTaggedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [sortOption, setSortOption] = useState('date-desc'); // Default sort by date descending

    useEffect(() => {
        const fetchTaggedSongs = async () => {
            try {
                const songs = await API.fetchTaggedSongs();

                // Fetch album images for each song
                const songsWithImages = await Promise.all(songs.map(async (song) => {
                    const searchQuery = `${song.title} ${song.artist}`;
                    const searchResult = await API.searchSongs(searchQuery);
                    const albumImageUrl = searchResult?.tracks?.items?.[0]?.album?.images?.[0]?.url || null;
                    return { ...song, albumImageUrl };
                }));

                setTaggedSongs(songsWithImages);
            } catch (error) {
                console.error('Error fetching tagged songs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo.id) {
            fetchTaggedSongs();
        }
    }, [userInfo]);

    const openModal = (song) => {
        setSelectedSong(song);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSong(null);
    };

    const deleteSong = async () => {
        try {
            await API.deleteTaggedSong(selectedSong.id);
            setTaggedSongs(taggedSongs.filter(song => song.id !== selectedSong.id));
            closeModal();
        } catch (error) {
            console.error('Error deleting song:', error);
        }
    };

    const openEditModal = (song) => {
        setSelectedSong(song);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedSong(null);
    };

    const saveTags = async (updatedTags) => {
        try {
            const updatedSong = await API.updateSongTags(selectedSong.id, updatedTags);
            setTaggedSongs(taggedSongs.map(song => song.id === updatedSong.id ? updatedSong : song));
            closeEditModal();
            window.location.reload();
        } catch (error) {
            console.error('Error updating tags:', error);
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const sortedSongs = () => {
        let sorted = [...taggedSongs];
        if (sortOption === 'title-asc') {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === 'title-desc') {
            sorted.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortOption === 'date-asc') {
            sorted.sort((a, b) => new Date(a.taggedAt) - new Date(b.taggedAt));
        } else if (sortOption === 'date-desc') {
            sorted.sort((a, b) => new Date(b.taggedAt) - new Date(a.taggedAt));
        }
        return sorted;
    };

    return (
        <div className="container tags-page-container">
            <div className='row'>
                <div className='col-md-12 sub-screen tags-page-sub-screen'>
                    <div className='tagged-songs-header'>
                        <h1>Your Tagged Songs</h1>
                        <div className="sort-filter-buttons">
                            <select value={sortOption} onChange={handleSortChange}>
                                <option value="date-desc">Date Descending</option>
                                <option value="date-asc">Date Ascending</option>
                                <option value="title-asc">Title Ascending</option>
                                <option value="title-desc">Title Descending</option>
                            </select>
                        </div>
                    </div>
                    {loading ? (
                        <div className="spinner"></div>
                    ) : (
                        sortedSongs().length > 0 ? (
                            <ul className="tagged-songs-list">
                                {sortedSongs().map((song) => (
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
                                            <div className='action-buttons'>
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className="trash-icon"
                                                    onClick={() => openModal(song)}
                                                />
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                    className="edit-icon"
                                                    onClick={() => openEditModal(song)}
                                                />
                                            </div>
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

            <CustomModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                onConfirm={deleteSong}
                title="Confirm Delete"
                message={`Are you sure you want to delete the tagged song "${selectedSong?.title}" by ${selectedSong?.artist}?`}
            />

            <EditTagsModal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                song={selectedSong}
                onSave={saveTags}
            />
        </div>
    );
};

export default TagsScreen;
