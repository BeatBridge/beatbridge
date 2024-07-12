import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import './trendingartists.css';
import API from '../../api.js';

function TrendingArtists() {
    const [userInfo, setUserInfo] = useState(null);
    const [artistsTrending, setArtistsTrending] = useState([]);
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
        const fetchTrendingArtists = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                const trendingData = await API.getTrendingArtists(jwt);
                if (trendingData.error) {
                    setError(trendingData.error);
                } else {
                    // Aggregate weekly momentum
                    const artistMomentum = {};
                    for (const record of trendingData) {
                        if (!artistMomentum[record.artistId]) {
                            artistMomentum[record.artistId] = {
                                momentum: 0,
                                artist: record.artist
                            };
                        }
                        artistMomentum[record.artistId].momentum += record.momentum;
                    }

                    // Calculate the average momentum for the week
                    const weeklyTrendingArtists = Object.values(artistMomentum)
                        .map(data => ({
                            artist: data.artist,
                            momentum: data.momentum / 7 // Average over a week
                        }))
                        .sort((a, b) => b.momentum - a.momentum)
                        .slice(0, 5); // Display only Top 5 artists

                    setArtistsTrending(weeklyTrendingArtists);
                }
            } catch (err) {
                setError('Failed to fetch trending artists');
            }
        };

        fetchTrendingArtists();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container">
            <div className='row'>
                <div className='col-md-2'>
                    <NavLink to="/" className="auth-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='auth-logo-container'>
                                <img src={logoImg} alt="logo" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-12'>
                    <h1>Hi {userInfo.username}, here are some artists who have been gaining momentum recently and may be worth checking out:</h1>
                    <ul>
                        {artistsTrending.map((trending) => (
                            <li key={trending.artist.id}>
                                {trending.artist.name} - Momentum: {trending.momentum.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default TrendingArtists;
