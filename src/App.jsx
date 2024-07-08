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
import TaggingScreen from './components/tagscreen/TaggingScreen.jsx';
import ArtistDashboard from './components/dashboard/ArtistDashboard.jsx';
import TrendingScreen from './components/trendscreen/TrendingScreen.jsx';
import Profile from './components/profile/Profile.jsx';
import Friends from './components/friends/Friends.jsx';
import Favourites from './components/favourites/Favourites.jsx';
import Settings from './components/settings/Settings.jsx';
import Chatbot from './components/chatbot/Chatbot.jsx';
import Map from './components/map/Map.jsx';
import TrendingArtists from './components/trendingartists/TrendingArtists.jsx';

function App() {
    const [JWT, setJWT] = useState(null);
    const [userInfo, setUserInfo] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const localJWT = localStorage.getItem('jwt');
        if (localJWT) {
            setJWT(localJWT);
        }
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (JWT) {
                const data = await API.getUserInfo(JWT);
                if (data.hasOwnProperty("error")) {
                    setJWT(null);
                    navigate('/login');
                } else {
                    setUserInfo(data);
                }
            }
        };
        fetchUserInfo();
    }, [JWT, navigate]);

    return (
        <>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path='/login' element={<Login setJWT={setJWT} />} />
                <Route path='/map' element={<Map />} />
                <Route path="/profile" element={
                    <RequireAuth>
                        <Profile userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/friends" element={
                    <RequireAuth>
                        <Friends userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/trending" element={
                    <RequireAuth>
                        <TrendingArtists userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/favourites" element={
                    <RequireAuth>
                        <Favourites userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/l/dashboard" element={
                    <RequireAuth>
                        <ListenerDashboard userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/tags" element={
                    <RequireAuth>
                        <TaggingScreen userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/chatbot" element={
                    <RequireAuth>
                        <Chatbot userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="/settings" element={
                    <RequireAuth>
                        <Settings userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="a/dashboard" element={
                    <RequireAuth>
                        <ArtistDashboard userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path="a/trends" element={
                    <RequireAuth>
                        <TrendingScreen userInfo={userInfo} />
                    </RequireAuth> } />
                <Route path='/signup' element={<SignUp setJWT={setJWT} />} />
                <Route path='/verify/:token' element={<EmailVerification />} />
                <Route path='/callback' element={<SpotifyCallBack />} />
				<Route path='/error' element={<Error />} />
            </Routes>
        </>
    );
}

export default App;
