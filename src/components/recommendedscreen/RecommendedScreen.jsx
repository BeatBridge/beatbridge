import React, { useState, useEffect } from 'react';
import './recommendedscreen.css';
import API from '../../api.js';

function RecommendedScreen() {
    const [userInfo, setUserInfo] = useState(null);
    const [recommendedArtist, setRecommendedArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                const data = await API.getUserInfo(jwt);
                if (data.error) {
                    setError(data.error);
                } else {
                    setUserInfo(data);
                }
            } catch (err) {
                setError('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        const fetchRecommendedArtist = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                const data = await API.getLatestRecommendation(jwt);
                if (data.error) {
                    setError(data.error);
                } else {
                    setRecommendedArtist(data);
                }
            } catch (err) {
                setError('Failed to fetch recommended artist');
            }
        };

        fetchRecommendedArtist();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container">
            <div className='row'>
                <div className='col-md-12 sub-screen'>
                    <h1>Hi {userInfo.username}, we recommend you to check out this artist:</h1>
                    <h2>{recommendedArtist?.artistName}</h2>
                    <p>{recommendedArtist?.reason}</p>
                </div>
            </div>
        </div>
    );
}

export default RecommendedScreen;
