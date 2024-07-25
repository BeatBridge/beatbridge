import React, { useState, useEffect } from 'react';
import './recommendation.css';
import API from '../../api.js';

function Recommendation() {
    const [userInfo, setUserInfo] = useState(null);
    const [recommendedArtist, setRecommendedArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState({ genre: true, mood: true, tempo: true });
    const [isDbRecommendation, setIsDbRecommendation] = useState(false);

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

    const fetchRecommendedArtist = async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            const data = await API.getLatestRecommendation(jwt);
            if (data.error) {
                setError(data.error);
            } else {
                setRecommendedArtist(data);
                setIsDbRecommendation(data.isDbRecommendation);
            }
        } catch (err) {
            console.error('Failed to fetch recommended artist:', err);
            setError('Failed to fetch recommended artist');
        }
    };

    useEffect(() => {
        fetchRecommendedArtist();
    }, []);

    const handlePreferenceChange = (tag, value) => {
        setPreferences(prev => ({ ...prev, [tag]: value }));
    };

    const calculateDynamicWeights = () => {
        const selectedTags = Object.keys(preferences).filter(tag => preferences[tag]);
        const selectedCount = selectedTags.length;

        if (selectedCount === 0 || selectedCount === 3) {
            // Default weights if all or no tags are selected
            return { genre: 0.5, mood: 0.3, tempo: 0.2 };
        } else if (selectedCount === 2) {
            // Each selected tag gets a weight of 0.5 if two tags are selected
            return {
                genre: selectedTags.includes('genre') ? 0.5 : 0,
                mood: selectedTags.includes('mood') ? 0.5 : 0,
                tempo: selectedTags.includes('tempo') ? 0.5 : 0
            };
        } else if (selectedCount === 1) {
            // The selected tag gets a weight of 1 if one tag is selected
            return {
                genre: selectedTags.includes('genre') ? 1 : 0,
                mood: selectedTags.includes('mood') ? 1 : 0,
                tempo: selectedTags.includes('tempo') ? 1 : 0
            };
        }
    };

    const generateNewRecommendation = async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            const dynamicWeights = calculateDynamicWeights();
            const data = await API.generateRecommendation(jwt, dynamicWeights);
            if (data.error) {
                setError(data.error);
            } else {
                setRecommendedArtist(data);
                setIsDbRecommendation(true);
            }
        } catch (err) {
            console.error('Failed to generate new recommendation:', err);
            setError('Failed to generate new recommendation');
        }
    };

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
                    {isDbRecommendation && (
                        <div>
                            <div className="preferences">
                                <label>
                                    Genre:
                                    <input type="checkbox" checked={preferences.genre} onChange={(e) => handlePreferenceChange('genre', e.target.checked)} />
                                </label>
                                <label>
                                    Mood:
                                    <input type="checkbox" checked={preferences.mood} onChange={(e) => handlePreferenceChange('mood', e.target.checked)} />
                                </label>
                                <label>
                                    Tempo:
                                    <input type="checkbox" checked={preferences.tempo} onChange={(e) => handlePreferenceChange('tempo', e.target.checked)} />
                                </label>
                            </div>
                            <button onClick={generateNewRecommendation}>Generate New Recommendation</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Recommendation;
