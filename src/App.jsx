import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Landing from './components/landing/Landing';
import ListenerDashboard from './components/listener/dashboard/ListenerDashboard';
import Login from './components/login/Login';
import SignUp from './components/signup/SignUp';
import EmailVerification from './components/signup/EmailVerification.jsx';
import API from './api.js';
import SpotifyCallBack from './components/spotifycallback/SpotifyCallBack.jsx';
import SpotifyConfirmation from './components/spotifyconfirmation/SpotifyConfirmation.jsx';
import Error from './components/error/Error.jsx';

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
                <Route path="/l/dashboard" element={<ListenerDashboard userInfo={userInfo} />} />
                <Route path='/login' element={<Login setJWT={setJWT} />} />
                <Route path='/signup' element={<SignUp setJWT={setJWT} />} />
                <Route path='/verify/:token' element={<EmailVerification />} />
                <Route path='/callback' element={<SpotifyCallBack />} />
                <Route path='/spotify-confirmation' element={<SpotifyConfirmation />} />
				<Route path='/error' element={<Error />} />
            </Routes>
        </>
    );
}

export default App;
