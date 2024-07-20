import { useState, useEffect } from 'react';
import './trendingartists.css';
import API from '../../api.js';
import MomentumChart from './MomentumChart';

function TrendingArtists() {
    const [userInfo, setUserInfo] = useState(null);
    const [artistsTrending, setArtistsTrending] = useState([]);
    const [momentumData, setMomentumData] = useState(null);
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
                    // Sort the artists by momentum from highest to lowest and slice to get only the top 5
                    const sortedTrendingData = trendingData.sort((a, b) => b.momentum - a.momentum).slice(0, 5);
                    setArtistsTrending(sortedTrendingData);

                    // Fetch and process momentum data for only the top 5 trending artists
                    const trendingArtistIds = sortedTrendingData.map(artist => artist.artist.id);
                    const momentumData = await API.getTrendingArtistsMomentum(jwt, trendingArtistIds);
                    if (momentumData.error) {
                        setError(momentumData.error);
                    } else {
                        const labels = [];
                        const datasets = {};

                        momentumData.forEach(record => {
                            const date = new Date(record.date).toLocaleDateString();
                            if (!labels.includes(date)) {
                                labels.push(date);
                            }
                            if (!datasets[record.artist.name]) {
                                datasets[record.artist.name] = {
                                    label: record.artist.name,
                                    data: [],
                                    borderColor: getRandomColor(),
                                    fill: false
                                };
                            }
                            datasets[record.artist.name].data.push({
                                x: date,
                                y: record.momentum
                            });
                        });

                        setMomentumData({
                            labels,
                            datasets: Object.values(datasets)
                        });
                    }
                }
            } catch (err) {
                setError('Failed to fetch trending artists');
            }
        };

        fetchTrendingArtists();
    }, []);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container">
            <div className='row'>
                <div className='col-md-12 sub-screen sub-screen-trending'>
                    <h1>Hi {userInfo?.username}, here are some artists who have been gaining momentum recently and may be worth checking out:</h1>
                    {momentumData && <MomentumChart data={momentumData} />}
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
