import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBell, FaUser, FaTag } from 'react-icons/fa';
import { faEarthAmericas, faChartLine, faGauge, faGear, faMicrochip, faUserGroup, faWandMagicSparkles, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import logoImg from '/beatbridge_logo.png';
import SpotifyOAuth from '../spotifyoauth/SpotifyOAuth.jsx';
import GlobalTop50 from '../globaltop50/GlobalTop50.jsx';
import TaggingForm from '../tagform/TaggingForm.jsx';
import MobileDashboard from '../dashboard/MobileDashboard';
import FriendsSidebar from '../friends/FriendsSidebar';
import ShimmerLoader from '../shimmerloader/ShimmerLoader.jsx';
import '../dashboard/ldashboard.css';
import './dashboardlayout.css';
import API from '../../api.js';

const DEFAULT_PROFILE_PICTURE_URL = '/src/assets/default_pfp.jpg';

function DashboardLayout({
    userInfo,
    handleLogout,
    isSpotifySignedIn,
    globalTop50,
    handleTrackClick,
    searchResults,
    selectedTrack,
    showTaggingForm,
    setShowTaggingForm,
    handleTagButtonClick,
    handleCloseTrack,
    handleTag,
    handleSearchResults,
    handleSuggestionClick,
    viral50Global,
    loadingGlobalTop50,
    loadingViral50Global
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE_URL);
    const [selectedUser, setSelectedUser] = useState(null); // State to store selected user
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [playerReady, setPlayerReady] = useState(false); // Track if the player is ready
    const [isPlaying, setIsPlaying] = useState(false); // Track if the player is playing
    const [loading, setLoading] = useState(true); // Add this line
    const playerRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const response = await API.fetchProfilePicture(userInfo.id);
                if (response.type.includes('image')) {
                    setProfilePictureUrl(URL.createObjectURL(response));
                }
            } catch (error) {
                console.error('Error fetching profile picture:', error);
                setProfilePictureUrl(DEFAULT_PROFILE_PICTURE_URL); // Fallback to default picture if there's an error
            }
        };

        if (userInfo.id) {
            fetchProfilePicture();
        }
    }, [userInfo]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.l-right-sidebar-user-info')) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const chatHistory = await API.fetchChatHistory();
                setChatHistory(chatHistory);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            }
        };

        fetchChatHistory();
    }, []);

    useEffect(() => {
        const onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('hidden-player', {
                height: '0',
                width: '0',
                events: {
                    onReady: () => {
                        setPlayerReady(true);
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            onYouTubeIframeAPIReady();
        } else {
            window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before starting data fetch
            try {
                if (isSpotifySignedIn && !viral50Global.length) {
                    await handleSearchResults();
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false); // Set loading to false after data fetch is complete
            }
        };

        fetchData();
    }, [isSpotifySignedIn, viral50Global, handleSearchResults]);

    const getNavLinkClass = ({ isActive }) => (isActive ? 'menu active' : 'menu');

    const handleChatClick = (user) => {
        setSelectedUser(user);
        setMessages([]);
        navigate('/friends');
    };

    const closeChat = () => {
        setSelectedUser(null);
        setMessages([]);
    };

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            const message = {
                userId: selectedUser.id,
                text: newMessage,
                sender: 'me',
                timestamp: new Date(),
            };
            setMessages((prevMessages) => [...prevMessages, message]);
            setNewMessage('');
        }
    };

    const handlePlayTrack = async () => {
        if (!selectedTrack) return;
        if (!playerReady) {
            console.error('Player is not ready');
            return;
        }

        if (isPlaying) {
            playerRef.current.stopVideo();
            setIsPlaying(false);
        } else {
            try {
                const videoId = await API.searchYouTubeMusic(selectedTrack.name, selectedTrack.artists[0].name);
                if (videoId) {
                    playerRef.current.loadVideoById(videoId);
                    setIsPlaying(true);
                } else {
                    console.error('Track not found on YouTube Music');
                }
            } catch (error) {
                console.error('Error playing track:', error);
            }
        }
    };

    return (
        <>
            <div className="desktop-dashboard">
                <div className="l-dashbaord-container">
                    <div className="row">
                        {/* LEFT COLUMN */}
                        <div className="l-left-sidebar col-md-2">
                            <div className={`sidebar-content ${isMenuOpen ? 'show' : ''}`}>
                                <NavLink to="/" className="l-logo" title="beatbridge_logo">
                                    <div className="parent-logo-container">
                                        <div className="logo-container">
                                            <img src={logoImg} alt="logo img-fluid" />
                                        </div>
                                        <div>BeatBridge</div>
                                    </div>
                                </NavLink>

                                <div className="menu-items-container">
                                    <h4>Menu</h4>
                                    <hr />

                                    <div className="l-menu-items">
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/profile' })}>
                                            <FaUser className="menu-icon" />
                                            <NavLink to="/profile" className="menu-item">
                                                <h5>Profile</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/l/dashboard' })}>
                                            <FontAwesomeIcon icon={faGauge} className="menu-icon" />
                                            <NavLink to="/l/dashboard" className="menu-item">
                                                <h5>Dashboard</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/tags' })}>
                                            <FaTag className="menu-icon" />
                                            <NavLink to="/tags" className="menu-item">
                                                <h5>Tags</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/trending' })}>
                                            <FontAwesomeIcon icon={faChartLine} className="menu-icon" />
                                            <NavLink to="/trending" className="menu-item">
                                                <h5>Trending</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/friends' })}>
                                            <FontAwesomeIcon icon={faUserGroup} className="menu-icon" />
                                            <NavLink to="/friends" className="menu-item">
                                                <h5>Friends</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/recommended' })}>
                                            <FontAwesomeIcon icon={faWandMagicSparkles} className="menu-icon" />
                                            <NavLink to="/recommended" className="menu-item">
                                                <h5>Recommended</h5>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4>Help</h4>
                                    <hr />

                                    <div className="l-menu-items">
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/settings' })}>
                                            <FontAwesomeIcon icon={faGear} className="menu-icon" />
                                            <NavLink to="/settings" className="menu-item">
                                                <h5>Settings</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/chatbot' })}>
                                            <FontAwesomeIcon icon={faMicrochip} className="menu-icon" />
                                            <NavLink to="/chatbot" className="menu-item">
                                                <h5>Chat With AI</h5>
                                            </NavLink>
                                        </div>
                                        <div className={getNavLinkClass({ isActive: window.location.pathname === '/map' })}>
                                            <FontAwesomeIcon icon={faEarthAmericas} className="menu-icon" />
                                            <NavLink to="/map" className="menu-item">
                                                <h5>Map</h5>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE COLUMN */}
                        <div className="col-md-7 scrollable-column">
                            <Outlet context={{ selectedUser, setSelectedUser, messages, setMessages, newMessage, setNewMessage, sendMessage, closeChat, chatHistory, userInfo, loading }} />
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="l-right-sidebar col-md-3">
                            <div className="l-right-sidebar-top">
                                <div className="l-right-sidebar-user-info" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    <div className="l-dashboard-profile-container">
                                        <img src={profilePictureUrl} alt="Profile" className="profile-picture" />
                                    </div>
                                    <div className="l-dashboard-user-name">
                                        <h4>Welcome, {userInfo.username}</h4>
                                        <p>{userInfo.isPremium ? 'Premium' : 'Free'} Subscriber</p>
                                        <SpotifyOAuth isSpotifySignedIn={isSpotifySignedIn} />
                                    </div>
                                    <div>
                                        <FontAwesomeIcon icon={faAngleDown} className='menu-icon dropdown-icon' />
                                    </div>
                                </div>
                                <div className="l-bell-icon-container">
                                    <FaBell className="l-dash-bell-icon" />
                                </div>
                            </div>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <button onClick={() => navigate('/profile')}>Profile</button>
                                    <hr />
                                    <button onClick={() => navigate('/settings')}>Settings</button>
                                    <hr />
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}

                            {location.pathname === '/friends' ? (
                                <FriendsSidebar onChatClick={handleChatClick} userInfo={userInfo} />
                            ) : (
                                <>
                                    <h4 className="l-top-artist-column">Global Top 3</h4>
                                    {isSpotifySignedIn ? (
                                        loadingGlobalTop50 ? (
                                            <ShimmerLoader type="track" count={3} />
                                        ) : (
                                            globalTop50.length > 0 ? (
                                                <GlobalTop50 tracks={globalTop50.slice(0, 3)} onTrackClick={handleTrackClick} />
                                            ) : (
                                                <p>No top 3 artists found.</p>
                                            )
                                        )
                                    ) : (
                                        <p>Please sign in to Spotify to view this data.</p>
                                    )}
                                </>
                            )}

                            <div>
                                {selectedTrack && (
                                    <div className="selected-track-details">
                                        <h4>{selectedTrack.name}</h4>
                                        <p>{selectedTrack.artist}</p>
                                        {selectedTrack.album.images && selectedTrack.album.images.length > 0 ? (
                                            <div className="tag-art-container">
                                                <img src={selectedTrack.album.images[0].url} alt="Track Art" className="tag-art" />
                                            </div>
                                        ) : (
                                            <div>No image available</div>
                                        )}
                                        <button className={`btn mt-2 ${isPlaying ? 'btn-danger' : 'btn-success'}`} onClick={handlePlayTrack}>
                                            {isPlaying ? 'Stop' : 'Play'}
                                        </button>
                                        <button className="btn btn-primary mt-2" onClick={handleTagButtonClick}>
                                            Tag
                                        </button>
                                        <button className="btn btn-secondary mt-2" onClick={handleCloseTrack}>
                                            Close
                                        </button>
                                        {showTaggingForm && (
                                            <TaggingForm song={selectedTrack} onTag={handleTag} onClose={() => setShowTaggingForm(false)} />
                                        )}
                                    </div>
                                )}
                                {searchResults !== undefined && !selectedTrack && searchResults.length > 0 && (
                                    <div className="search-results">
                                        {searchResults.map((track, index) => (
                                            <div key={index} className="search-result" onClick={() => handleTrackClick(track)}>
                                                <h4>{track.name}</h4>
                                                <p>{track.artists[0].name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mobile-dashboard">
                <MobileDashboard
                    userInfo={userInfo}
                    handleLogout={handleLogout}
                    isSpotifySignedIn={isSpotifySignedIn}
                    globalTop50={globalTop50}
                    handleTrackClick={handleTrackClick}
                    searchResults={searchResults}
                    selectedTrack={selectedTrack}
                    showTaggingForm={showTaggingForm}
                    setShowTaggingForm={setShowTaggingForm}
                    handleTagButtonClick={handleTagButtonClick}
                    handleCloseTrack={handleCloseTrack}
                    handleTag={handleTag}
                    handleSearchResults={handleSearchResults}
                    handleSuggestionClick={handleSuggestionClick}
                    viral50Global={viral50Global}
                    loading={loading}
                />
            </div>
            <div id="hidden-player" style={{ display: 'none' }}></div>
        </>
    );
}

export default DashboardLayout;
