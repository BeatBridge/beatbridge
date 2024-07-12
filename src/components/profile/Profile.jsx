import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import { FaBell, FaTag, FaUser } from 'react-icons/fa';
import { faEarthAmericas, faChartLine, faGauge, faGear, faMicrochip, faUserGroup, faPenToSquare, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import SpotifyOAuth from '../spotifyoauth/SpotifyOAuth.jsx';
import API from '../../api.js'
import "../dashboard/ldashboard.css";
import './profile.css';
import GlobalTop50 from '../globaltop50/GlobalTop50.jsx';
import UserProfileViral from '../userprofileviral/UserProfileViral.jsx';
import UserProfileTrending from '../userprofiletrending/UserProfileTrending.jsx';

function ListenerDashboard() {
    const [userInfo, setUserInfo] = useState(null);
    const [globalTop50, setGlobalTop50] = useState([]);
    const [error, setError] = useState(null);
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

            fetchGlobalTop50();
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

    return (
        <div className='l-profile-container'>
            <div className='row'>

                {/* LEFT COLUMN */}
                <div className="l-left-sidebar col-md-2 profile-left">
                    <NavLink to="/" className="l-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='logo-container'>
                                <img src={logoImg} alt="logo img-fluid" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>

                    <div className='menu-items-container'>
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
                                <FaTag className='menu-icon' />
                                <NavLink to='/tags'><h5>Tags</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faUserGroup} className='menu-icon' />
                                <NavLink to='/friends'><h5>Friends</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faChartLine} className='menu-icon' />
                                <NavLink to='/trending'><h5>Trending</h5></NavLink>
                            </div>
                        </div>

                    </div>
                    <div>
                        <h4>Help</h4>
                        <hr />

                        <div className='l-menu-items'>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGear} className='menu-icon' />
                                <NavLink to='/settings'><h5>Settings</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faMicrochip} className='menu-icon' />
                                <NavLink to='/chatbot'><h5>Chat With AI</h5></NavLink>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faEarthAmericas} className='menu-icon' />
                                <NavLink to='/map'><h5>Map</h5></NavLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN */}
                <div className='col-md-7 profile-info'>
                    <div className='profile-details'>
                        <div className='profile-sub-details'>
                            <div className='profile-pic'>
                                <FaUser className='l-dash-user-icon' />
                            </div>
                            <div>
                                <h1>{userInfo.username}</h1>
                                <h3><strong>Email:</strong> {userInfo.email}</h3>
                                <h3><strong>Subscription:</strong> {userInfo.isPremium ? 'Premium' : 'Free'}</h3>
                            </div>
                        </div>
                        <div className='edit-profile-buttons'>
                            <div className='edit-profile-icon-container'>
                                <FontAwesomeIcon icon={faPenToSquare} className='edit-profile-icon' />
                            </div>
                            <div className='edit-profile-icon-container'>
                                <FontAwesomeIcon icon={faShareNodes} className='edit-profile-icon' />
                            </div>
                        </div>
                    </div>
                    <div className='user-profile-details'>
                        <div className='user-profile-details-top'>
                            <div className='user-profile-details-buttons'>
                                <h2><strong>Public Playlist</strong></h2>
                                <h5>Show All</h5>
                            </div>
                            <div className='user-profile-viral-container'>
                                <UserProfileViral
                                    desc="This is Billie Eilish"
                                    followerCount="24,534"
                                />

                                <UserProfileViral
                                    desc="This is J Cole"
                                    followerCount="39,768"
                                />

                                <UserProfileViral
                                    desc="This is Asake"
                                    followerCount="10,025"
                                />

                                <UserProfileViral
                                    desc="This is Taylor Swift"
                                    followerCount="330,472"
                                />

                                <UserProfileViral
                                    desc="This is Burna Boy"
                                    followerCount="76,902"
                                />

                                <UserProfileViral
                                    desc="This is Central Cee"
                                    followerCount="102,022"
                                />
                            </div>
                        </div>
                        <div className='user-profile-details-bottom'>
                            <div className='user-profile-details-buttons'>
                                <h2><strong>Artists You Follow</strong></h2>
                                <h5>Show All</h5>
                            </div>
                            <div className='user-profile-trending-container'>
                                <UserProfileTrending
                                    name="Asake"
                                />

                                <UserProfileTrending
                                    name="Billie Eilish"
                                />

                                <UserProfileTrending
                                    name="Central Cee"
                                />

                                <UserProfileTrending
                                    name="Metro Boomin"
                                />

                                <UserProfileTrending
                                    name="PARTYNEXTDOOR"
                                />

                                <UserProfileTrending
                                    name="Rema"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className='l-right-sidebar col-md-3 profile-right'>
                    <div className='l-right-sidebar-top'>
                        <div className='l-right-sidebar-user-info'>
                            <div className='l-dashboard-profile-container'>
                                <FaUser className='l-dash-user-icon' />
                            </div>

                            <div className='l-dashboard-user-name'>
                                <h4>Welcome, {userInfo.username}</h4>
                                <p>{userInfo.isPremium ? 'Premium' : 'Free'} Subscriber</p>
                                <SpotifyOAuth isSpotifySignedIn={isSpotifySignedIn} />
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                        <div className='l-bell-icon-container'>
                            <FaBell className='l-dash-bell-icon' />
                        </div>
                    </div>

                    <div>
                        <h4 className='l-top-artist-column'>Global Top 50</h4>
                        {isSpotifySignedIn ? (
                            globalTop50.length !== undefined ? (
                                <div>
                                    <GlobalTop50 tracks={globalTop50.slice(0, 3)} />
                                </div>
                            ) : (
                                <p>No top 50 artists found.</p>
                            )
                        ) : (
                            <p>Please sign in to Spotify to view this data.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListenerDashboard;
