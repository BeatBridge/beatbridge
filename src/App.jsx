import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Landing from './components/landing/Landing';
import ListenerDashboard from './components/dashboard/ListenerDashboard.jsx';
import Login from './components/login/Login';
import SignUp from './components/signup/SignUp';
import EmailVerification from './components/emailverification/EmailVerification.jsx';
import API from './api.js';
import SpotifyCallBack from './components/spotifycallback/SpotifyCallBack.jsx';
import Error from './components/error/Error.jsx';
import RequireAuth from './components/requireauth/RequireAuth.jsx';
import TagsScreen from './components/tagscreen/TagsScreen.jsx';
import ArtistTrendingScreen from './components/artisttrendscreen/ArtistTrendingScreen.jsx';
import Profile from './components/profile/Profile.jsx';
import Friends from './components/friends/Friends.jsx';
import Favourites from './components/favourites/Favourites.jsx';
import Settings from './components/settings/Settings.jsx';
import Chatbot from './components/chatbot/Chatbot.jsx';
import Map from './components/map/Map.jsx';
import TrendingArtists from './components/trendingartists/TrendingArtists.jsx';
import DashboardLayout from './components/dashboardlayout/DashboardLayout.jsx';
import Recommendation from './components/recommendation/Recommendation.jsx';
import ForgotPassword from './components/ForgotPassword/ForgotPassword.jsx';
import ErrorBoundary from './components/errorboundary/ErrorBoundary.jsx';

function App() {
    const [JWT, setJWT] = useState(localStorage.getItem('jwt'));
    const [userInfo, setUserInfo] = useState({});
    const [globalTop50, setGlobalTop50] = useState([]);
    const [viral50Global, setViral50Global] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [showTaggingForm, setShowTaggingForm] = useState(false);
    const [isSpotifySignedIn, setIsSpotifySignedIn] = useState(false);
    const [loadingGlobalTop50, setLoadingGlobalTop50] = useState(false);
    const [loadingViral50Global, setLoadingViral50Global] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (JWT) {
            const fetchUserInfo = async () => {
                const data = await API.getUserInfo(JWT);
                if (data.hasOwnProperty("error")) {
                    handleLogout();
                    navigate('/login');
                } else {
                    setUserInfo(data);
                    setIsSpotifySignedIn(!!data.spotifyAccessToken);
                }
            };
            fetchUserInfo();
        }
    }, [JWT, navigate]);

    useEffect(() => {
        if (isSpotifySignedIn && globalTop50.length === 0 && !loadingGlobalTop50) {
            fetchGlobalTop50();
        }
    }, [isSpotifySignedIn, globalTop50.length]);

    useEffect(() => {
        if (isSpotifySignedIn && viral50Global.length === 0 && !loadingViral50Global) {
            fetchViral50Global();
        }
    }, [isSpotifySignedIn, viral50Global.length]);

    const fetchGlobalTop50 = async () => {
        if (!JWT) return;
        setLoadingGlobalTop50(true);
        try {
            const data = await API.getGlobalTop50(userInfo.spotifyAccessToken);
            setGlobalTop50(data.tracks.items || []);
        } catch (err) {
            console.error(err.message || 'Failed to fetch global top 50.');
        } finally {
            setLoadingGlobalTop50(false);
        }
    };

    const fetchViral50Global = async () => {
        if (!JWT) return;
        setLoadingViral50Global(true);
        try {
            const data = await API.getViral50Global(userInfo.spotifyAccessToken);
            setViral50Global(data.tracks.items || []);
        } catch (err) {
            console.error(err.message || 'Failed to fetch viral 50 global.');
        } finally {
            setLoadingViral50Global(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('spotifyAuth');
        setJWT(null);
        setUserInfo({});
        setGlobalTop50([]);
        setViral50Global([]);
        navigate('/login');
        window.location.reload(); // Ensure full page reload
    };

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

    const handleUpdateProfile = async (updatedProfile) => {
        try {
            const data = await API.updateUserProfile(JWT, updatedProfile);
            if (data.error) {
                console.error(data.error);
            } else {
                setUserInfo(data);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleUpdatePassword = async (passwordData) => {
        try {
            const data = await API.updatePassword(JWT, passwordData);
            if (data.error) {
                console.error(data.error);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path='/login' element={<Login setJWT={setJWT} />} />
                <Route path='/signup' element={<SignUp setJWT={setJWT} />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/map' element={<Map />} />
                <Route path='/verify/:token' element={<EmailVerification />} />
                <Route path='/callback' element={<SpotifyCallBack />} />
                <Route path='/error' element={<Error />} />
                <Route element={
                    <RequireAuth>
                        <DashboardLayout
                            userInfo={userInfo}
                            handleLogout={handleLogout}
                            isSpotifySignedIn={isSpotifySignedIn}
                            globalTop50={globalTop50 || []}
                            viral50Global={viral50Global || []}
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
                            loadingGlobalTop50={loadingGlobalTop50}
                            loadingViral50Global={loadingViral50Global}
                        />
                    </RequireAuth>
                }>
                    <Route path="/profile" element={<Profile userInfo={userInfo} />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/trending" element={<TrendingArtists userInfo={userInfo} />} />
                    <Route path="/favourites" element={<Favourites userInfo={userInfo} />} />
                    <Route path="/l/dashboard" element={<ListenerDashboard userInfo={userInfo} handleSearchResults={handleSearchResults} handleSuggestionClick={handleSuggestionClick} handleTrackClick={handleTrackClick} isSpotifySignedIn={isSpotifySignedIn} viral50Global={viral50Global} loading={loadingViral50Global} />} />
                    <Route path="/tags" element={<TagsScreen userInfo={userInfo} />} />
                    <Route path="/recommended" element={<Recommendation userInfo={userInfo} />} />
                    <Route path="/chatbot" element={<Chatbot userInfo={userInfo} />} />
                    <Route path="/settings" element={<Settings userInfo={userInfo} handleUpdateProfile={handleUpdateProfile} handleUpdatePassword={handleUpdatePassword} handleLogout={handleLogout} />} />
                    <Route path="/a/trends" element={<ArtistTrendingScreen userInfo={userInfo} />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
