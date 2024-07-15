import React, { useEffect, useState } from 'react';
import LSearchForm from '../searchform/LSearchForm.jsx';
import { FaMusic } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphonesSimple } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discovergenre/DiscoverGenre.jsx';
import discoImg from '../../assets/genres/disco.jpg';
import popImg from '../../assets/genres/pop.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import rockImg from '../../assets/genres/rock.jpg';
import API from '../../api.js';
import Viral50Global from '../viral50global/Viral50Global.jsx';
import TaggingForm from '../tagform/TaggingForm.jsx';
import './ldashboard.css';

function ListenerDashboard() {
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [showTaggingForm, setShowTaggingForm] = useState(false);
    const [viral50Global, setViral50Global] = useState([]);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isSpotifySignedIn, setIsSpotifySignedIn] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const data = await API.getUserInfo(localStorage.getItem("jwt"));
            setUserInfo(data);
            setIsSpotifySignedIn(!!data.spotifyAccessToken);
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (isSpotifySignedIn) {
            const fetchViral50Global = async () => {
                try {
                    const data = await API.getViral50Global(userInfo.spotifyAccessToken);
                    setViral50Global(data.tracks.items || []);
                } catch (err) {
                    setError(err.message || 'Failed to fetch viral 50 global.');
                }
            };
            fetchViral50Global();
        }
    }, [userInfo, isSpotifySignedIn]);

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setShowTaggingForm(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSelectedTrack(suggestion);
        setSearchResults([]);
        setShowTaggingForm(false);

        if (suggestion.artists && suggestion.artists.length > 0) {
            trackArtistSearch(suggestion.artists[0].id);
        }
    };

    const handleTrackClick = (track) => {
        const updatedTrack = {
            ...track,
            album: {
                ...track.album,
                images: track.images || []
            }
        };
        setSelectedTrack(updatedTrack);
        setShowTaggingForm(false);

        if (track.artists && track.artists.length > 0) {
            trackArtistSearch(track.artists[0].id);
        }
    };

    const handleTagButtonClick = () => {
        setShowTaggingForm(true);
    };

    const handleTag = async (track, tags) => {
        const songData = {
            title: track.name,
            artist: track.artists ? track.artists[0].name : "Unknown Artist",
            album: track.album ? track.album.name : "Unknown Album",
            genre: tags.genre,
            mood: tags.mood,
            tempo: tags.tempo,
            customTags: JSON.stringify(tags.customTags),
        };
        try {
            const song = await API.createSong(songData);
            await API.tagSong(song.id, tags);
        } catch (error) {
            console.error('Error tagging track:', error);
        }
    };

    const handleCloseTrack = () => {
        setSelectedTrack(null);
    };

    const trackArtistSearch = async (artistId) => {
        try {
            await API.trackArtistSearch(artistId);
        } catch (error) {
            console.error('Error tracking artist search:', error);
        }
    };

    return (
        <div>
            <div>
                <LSearchForm onSearchResults={handleSearchResults} onSuggestionClick={handleSuggestionClick} />
            </div>
            <div>
                <div className='l-discover-genre-top'>
                    <h5>
                        <FaMusic className='l-discover-genre-music-icon' />
                    </h5>
                    <h2>
                        Discover Genre
                    </h2>
                </div>

                <div className='l-discover-genre-bottom'>
                    <DiscoverGenre
                        genre_img={discoImg}
                        genre_name="Disco"
                        track_num={120}
                    />
                    <DiscoverGenre
                        genre_img={popImg}
                        genre_name="Pop"
                        track_num={180}
                    />
                    <DiscoverGenre
                        genre_img={danceImg}
                        genre_name="Dance"
                        track_num={100}
                    />
                    <DiscoverGenre
                        genre_img={reggaeImg}
                        genre_name="Reggae"
                        track_num={170}
                    />
                    <DiscoverGenre
                        genre_img={rockImg}
                        genre_name="Rock"
                        track_num={200}
                    />
                </div>
            </div>
            <div>
                <div className='l-top-music-top'>
                    <h5>
                        <FontAwesomeIcon icon={faHeadphonesSimple} className='l-top-music-icon-header' />
                    </h5>
                    <h2>
                        Top 50 Viral Songs
                    </h2>
                </div>

                <div>
                    {isSpotifySignedIn ? (
                        viral50Global !== undefined ? (
                            <div>
                                <Viral50Global tracks={viral50Global.slice(0, 10)} onTrackClick={handleTrackClick} />
                            </div>
                        ) : (
                            <p>No top 50 global songs found.</p>
                        )
                    ) : (
                        <p>Please sign in to Spotify to view this data.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ListenerDashboard;
