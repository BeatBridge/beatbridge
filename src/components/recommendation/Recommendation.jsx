import React, { useState, useEffect } from 'react';
import './recommendation.css';
import API from '../../api.js';

function Recommendation() {
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
                console.error('Failed to fetch recommended artist:', err);
                setError('Failed to fetch recommended artist');
            }
        };

        fetchRecommendedArtist();
    }, []);

    if (loading) return <div className="shimmer"></div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container recommendation-container">
            <div className='row'>
                <div className='col-md-12 sub-screen recommendation-subscreen'>
                    <h1>Hi {userInfo?.username}, we recommend you to check out this artist:</h1>
                    {recommendedArtist && (
                        <div className="recommended-artist">
                            <img src={recommendedArtist.imageUrl} alt={recommendedArtist.artistName} className="artist-image" />
                            <div className="artist-details">
                                <h2>{recommendedArtist.artistName}</h2>
                                <p>{recommendedArtist.reason}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Recommendation;
