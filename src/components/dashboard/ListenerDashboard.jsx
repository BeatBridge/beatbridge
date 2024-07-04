import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useNavigate } from 'react-router-dom';
import "./ldashboard.css";
import logoImg from '/beatbridge_logo.png';
import LSearchForm from '../searchform/LSearchForm.jsx';
import { FaBell, FaHeart, FaMusic, FaTag, FaUser } from 'react-icons/fa';
import TopArtistCard from '../topartistcard/TopArtistCard.jsx';
import { faCircleQuestion, faGauge, faGear, faHeadphonesSimple, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discovergenre/DiscoverGenre.jsx';
import discoImg from '../../assets/genres/disco.jpg';
import popImg from '../../assets/genres/pop.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import rockImg from '../../assets/genres/rock.jpg';
import TopMusicCard from '../topmusiccard/TopMusicCard.jsx';
import API from '../../api.js'
import SpotifyOAuth from '../spotifyoauth/SpotifyOAuth.jsx';

function getAllSongs (resJSON){
    let allSongs = []

    if (!resJSON){ return []}

    for (let i = 0; i < resJSON.length; i++){
        const song = {
            "index" : i,
            "name" : resJSON[i].track.name,
            "artist" : resJSON[i].track.artists? resJSON[i].track.artists[0].name : "No Artist"
        }

        allSongs = [...allSongs, song]
    }

    return allSongs;
}

function ListenerDashboard() {
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
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
            const fetchData = async () => {
                try {
                    const artistData = await API.getTopArtists(userInfo.spotifyAccessToken);
                    const trackData = await API.getTopTracks(userInfo.spotifyAccessToken);
                    setTopArtists(artistData.items || []);
                    setTopTracks(trackData.items || []);
                } catch (err) {
                    setError(err.message || 'Failed to fetch data from Spotify.');
                }
            };

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

            fetchData();
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
                    <LSearchForm />
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
                                <h5>Profile</h5>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGauge} className='menu-icon' />
                                <h5>Dashboard</h5>
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
                        <h4 className='l-top-artist-column'>Top Artist</h4>
                        {isSpotifySignedIn ? (
                            topArtists.length > 0 ? (
                                topArtists.map(artist => (
                                    <TopArtistCard
                                        key={artist.id}
                                        artist_name={artist.name}
                                        artist_music={artist.genres[0]}
                                    />
                                ))
                            ) : (
                                <p>No top artists found.</p>
                            )
                        ) : (
                            <p>Please sign in to Spotify to view this data.</p>
                        )}

                        <h4 className='l-top-artist-column'>Global Top 50</h4>
                        {isSpotifySignedIn ? (
                            globalTop50.length !== undefined ? (
                                <div>
                                    {
                                        JSON.stringify(getAllSongs(globalTop50))
                                    }
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
                                Top Music
                            </h2>
                        </div>

                        <div className='l-top-music-bottom'>
                            {isSpotifySignedIn ? (
                                topTracks.length > 0 ? (
                                    topTracks.map((track, index) => (
                                        <TopMusicCard
                                            key={track.id}
                                            music_num={index + 1}
                                            music_name={track.name}
                                            music_duration={track.duration_ms}
                                            music_artist={track.artists[0].name}
                                        />
                                    ))
                                ) : (
                                    <p>No top tracks available.</p>
                                )
                            ) : (
                                <p>Please sign in to Spotify to view this data.</p>
                            )}
                            <h4 className='l-top-artist-column'>Global Top 50</h4>
                            {isSpotifySignedIn ? (
                                viral50Global !== undefined ? (
                                    <div>
                                        {
                                            JSON.stringify(getAllSongs(viral50Global))
                                        }
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
            </main>
        </div>
    );
}

export default ListenerDashboard;
