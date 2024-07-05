import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import LSearchForm from '../searchform/LSearchForm.jsx';
import { FaBell, FaHeart, FaMusic, FaTag, FaUser } from 'react-icons/fa';
import { faCircleQuestion, faGauge, faGear, faHeadphonesSimple, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discovergenre/DiscoverGenre.jsx';
import discoImg from '../../assets/genres/disco.jpg';
import popImg from '../../assets/genres/pop.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import rockImg from '../../assets/genres/rock.jpg';
import SpotifyOAuth from '../spotifyoauth/SpotifyOAuth.jsx';
import API from '../../api.js'
import "./ldashboard.css";
import GlobalTop50 from '../globaltop50/GlobalTop50.jsx';
import Viral50Global from '../viral50global/Viral50Global.jsx';
import SongActions from '../songactions/SongActions.jsx';

function ListenerDashboard() {
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
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
        if (results.length === 1) {
            setSelectedTrack(results[0]);
        }
        setSearchResults(results);
    }

    const handleTrackClick = (track) => {
        setSelectedTrack(null);
    }

    const handleTag = async (track, tags) => {
        const songData = {
            title: track.name,
            artist: track.artists[0].name
        }
        try{
            const song = await API.createSong(songData);
            await API.tagSong(song.id, tags);
            console.log('Song tagged:', song);
        } catch (error) {
            console.error('Error tagging track:', error);
        }
    };

    const handleViewDetails = (track) => {
        console.log('Viewing details of track:', track);
    }

    const handleAddToLibrary = (track) => {
        console.log('Adding track to library:', track);
    }

    return (
        <div className='l-dashbaord-container'>
            <div className='row'>
                <div className="l-left-sidebar col-md-2">
                    <NavLink to="/" className="l-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='logo-container'>
                                <img src={logoImg} alt="logo img-fluid" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>

                <div className='col-md-7'>
                    <LSearchForm onSearchResults={handleSearchResults} />
                </div>

                <div className='l-right-sidebar col-md-3'>
                    <div className='l-right-sidebar-user-info'>
                        <div className='l-dashboard-profile-container'>
                            <FaUser className='l-dash-user-icon' />
                        </div>

                        <div className='l-dashboard-user-name'>
                            <h4>Welcome, {userInfo.username}</h4>
                            <p>Premium Subscriber</p>
                            <SpotifyOAuth isSpotifySignedIn={isSpotifySignedIn} />
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                    <div className='l-bell-icon-container'>
                        <FaBell className='l-dash-bell-icon' />
                    </div>
                </div>
            </div>

            <main>
                <div className='row l-main-top'>
                    <div className='col-md-2 l-menu-bar'>
                        <h4>Menu</h4>
                        <hr />

                        <div className='l-menu-items'>
                            <div className='l-dashbaord-menu-items'>
                                <FaUser className='menu-icon' />
                                <NavLink to='/profile'><h5>Profile</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGauge} className='menu-icon' />
                                <NavLink to='/l/dashboard'><h5>Dashboard</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FaHeart className='menu-icon' />
                                <h5>Favourite</h5>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FaTag className='menu-icon' />
                                <h5>Tags</h5>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faUserGroup} className='menu-icon' />
                                <h5>Friends</h5>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-7 l-discover-genre'>
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

                    <div className='col-md-3 l-right-menu'>
                        <h4 className='l-top-artist-column'>Global Top 50</h4>
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
                <div className='row l-main-bottom'>
                    <div className='col-md-2 l-menu-bar-bottom'>
                        <h4>Help</h4>
                        <hr />

                        <div className='l-menu-items'>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGear} className='menu-icon' />
                                <h5>Profile</h5>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faCircleQuestion} className='menu-icon' />
                                <h5>FAQs</h5>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-7 l-top-music'>
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

                    <div className='col-md-3'>
                        {selectedTrack ? (
                            <div className='selected-track-details'>
                                <h4>{selectedTrack.name}</h4>
                                <p>{selectedTrack.artists[0].name}</p>
                                <img src={selectedTrack.album.images[0]?.url} alt="Track Art" />
                            </div>
                        ) : (
                            searchResults.length > 0 && (
                                <div className='search-results'>
                                    {searchResults.map((track, index) => (
                                        <div key={index} className='search-result' onClick={() => handleTrackClick(track)}>
                                            <h4>{track.name}</h4>
                                            <p>{track.artists[0].name}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ListenerDashboard;
