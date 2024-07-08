import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import LSearchForm from '../searchform/LSearchForm.jsx';
import { FaBell, FaHeart, FaMusic, FaTag, FaUser } from 'react-icons/fa';
import { faEarthAmericas, faGauge, faGear, faHeadphonesSimple, faMicrochip, faUserGroup, faStar } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discovergenre/DiscoverGenre.jsx';
import discoImg from '../../assets/genres/disco.jpg';
import popImg from '../../assets/genres/pop.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import rockImg from '../../assets/genres/rock.jpg';
import SpotifyOAuth from '../spotifyoauth/SpotifyOAuth.jsx';
import API from '../../api.js'
import "./adashboard.css";
import GlobalTop50 from '../globaltop50/GlobalTop50.jsx';
import Viral50Global from '../viral50global/Viral50Global.jsx';
import TaggingForm from '../tagform/TaggingForm.jsx';

function ArtistDashboard() {
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [showTaggingForm, setShowTaggingForm] = useState(false);
    const [globalTop50, setGlobalTop50] = useState([]);
    const [viral50Global, setViral50Global] = useState([]);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isSpotifySignedIn, setIsSpotifySignedIn] = useState(false);
    const navigate = useNavigate();

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
            const fetchGlobalTop50 = async () => {
                try {
                    const data = await API.getGlobalTop50(userInfo.spotifyAccessToken);
                    setGlobalTop50(data.tracks.items || []);
                } catch (err) {
                    setError(err.message || 'Failed to fetch global top 50.');
                }
            };

            const fetchViral50Global = async () => {
                try {
                    const data = await API.getViral50Global(userInfo.spotifyAccessToken);
                    setViral50Global(data.tracks.items || []);
                } catch (err) {
                    setError(err.message || 'Failed to fetch viral 50 global.');
                }
            };
            fetchGlobalTop50();
            fetchViral50Global();
        }
    }, [userInfo, isSpotifySignedIn]);

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('spotifyAuth');
        navigate('/login');
    };

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setShowTaggingForm(false);
    }

    const handleSuggestionClick = (suggestion) => {
        setSelectedTrack(suggestion);
        setSearchResults([]);
        setShowTaggingForm(false);
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

    return (
        <div className='a-dashbaord-container'>
            <div className='row'>
                <div className="a-left-sidebar col-md-2">
                    <NavLink to="/" className="a-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='logo-container'>
                                <img src={logoImg} alt="logo img-fluid" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>

                <div className='col-md-7'>
                    <LSearchForm onSearchResults={handleSearchResults} onSuggestionClick={handleSuggestionClick} />
                </div>

                <div className='a-right-sidebar col-md-3'>
                    <div className='a-right-sidebar-user-info'>
                        <div className='a-dashboard-profile-container'>
                            <FaUser className='a-dash-user-icon' />
                        </div>

                        <div className='a-dashboard-user-name'>
                            <h4>Welcome, {userInfo.username}</h4>
                            <SpotifyOAuth isSpotifySignedIn={isSpotifySignedIn} />
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faStar} className='a-artist-star-icon'/>
                    </div>
                    <div className='a-bell-icon-container'>
                        <FaBell className='a-dash-bell-icon' />
                    </div>
                </div>
            </div>

            <main>
                <div className='row a-main-top'>
                    <div className='col-md-2 a-menu-bar'>
                        <h4>Menu</h4>
                        <hr />

                        <div className='a-menu-items'>
                            <div className='a-dashbaord-menu-items'>
                                <FaUser className='menu-icon' />
                                <NavLink to='/profile'><h5>Profile</h5></NavLink>
                            </div>
                            <div className='a-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGauge} className='menu-icon' />
                                <NavLink to='/a/dashboard'><h5>Dashboard</h5></NavLink>
                            </div>
                            <div className='a-dashbaord-menu-items'>
                                <FaHeart className='menu-icon' />
                                <NavLink to='/favourites'><h5>Favourite</h5></NavLink>
                            </div>
                            <div className='a-dashbaord-menu-items'>
                                <FaTag className='menu-icon' />
                                <NavLink to='/tags'><h5>Tags</h5></NavLink>
                            </div>
                            <div className='a-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faUserGroup} className='menu-icon' />
                                <NavLink to='/friends'><h5>Friends</h5></NavLink>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-7 a-discover-genre'>
                        <div className='a-discover-genre-top'>
                            <h5>
                                <FaMusic className='a-discover-genre-music-icon' />
                            </h5>
                            <h2>
                                Discover Genre
                            </h2>
                        </div>

                        <div className='a-discover-genre-bottom'>
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

                    <div className='col-md-3 a-right-menu'>
                        <h4 className='a-top-artist-column'>Your Viral Songs Now</h4>
                        {isSpotifySignedIn ? (
                            globalTop50.length !== undefined ? (
                                <div>
                                    <GlobalTop50 tracks={globalTop50.slice(1, 4)} onTrackClick={handleTrackClick} />
                                </div>
                            ) : (
                                <p>No top 50 artists found.</p>
                            )
                        ) : (
                            <p>Please sign in to Spotify to view this data.</p>
                        )}
                    </div>
                </div>
                <div className='row a-main-bottom'>
                    <div className='col-md-2 a-menu-bar-bottom'>
                        <h4>Help</h4>
                        <hr />

                        <div className='a-menu-items'>
                            <div className='a-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGear} className='menu-icon' />
                                <NavLink to='/settings'><h5>Settings</h5></NavLink>
                            </div>
                            <div className='a-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faMicrochip} className='menu-icon' />
                                <NavLink to='/chatbot'><h5>Chat With AI</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faEarthAmericas} className='menu-icon' />
                                <NavLink to='/map'><h5>Map</h5></NavLink>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-7 a-top-music'>
                        <div className='a-top-music-top'>
                            <h5>
                                <FontAwesomeIcon icon={faHeadphonesSimple} className='a-top-music-icon-header' />
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

                    <div className='col-md-3 a-track-action'>
                        {selectedTrack && (
                            <div className='selected-track-details'>
                                <h4>{selectedTrack.name}</h4>
                                <p>{selectedTrack.artist}</p>
                                {selectedTrack.album.images && selectedTrack.album.images.length > 0 ? (
                                    <div className='tag-art-container'>
                                        <img src={selectedTrack.album.images[0].url} alt="Track Art" className='tag-art' />
                                    </div>
                                ) : (
                                    <div>No image available</div>
                                )}
                                <button className="btn btn-primary mt-2" onClick={handleTagButtonClick}>Tag</button>
                                <button className="btn btn-secondary mt-2" onClick={handleCloseTrack}>Close</button>
                                {showTaggingForm && (
                                    <TaggingForm
                                        song={selectedTrack}
                                        onTag={handleTag}
                                        onClose={() => setShowTaggingForm(false)}
                                    />
                                )}
                            </div>
                        )}
                        {!selectedTrack && searchResults.length > 0 && (
                            <div className='search-results'>
                                {searchResults.map((track, index) => (
                                    <div key={index} className='search-result' onClick={() => handleTrackClick(track)}>
                                        <h4>{track.name}</h4>
                                        <p>{track.artists[0].name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ArtistDashboard;
