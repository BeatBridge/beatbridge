import React, { useState, useEffect } from 'react';
import './recommendationhistory.css';
import API from '../../api.js';

function RecommendationHistory({ onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendationHistory = async () => {
            try {
                const jwt = localStorage.getItem('jwt');
                const data = await API.getRecommendationHistory(jwt);
                if (data.error) {
                    setError(data.error);
                } else {
                    setHistory(data);
                }
            } catch (err) {
                setError('Failed to fetch recommendation history');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendationHistory();
    }, []);

    if (loading) return <div className="shimmer"></div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="recommendation-history">
            <button className="close-button" onClick={onClose}>Close</button>
            <h2>Recommendation History</h2>
            {history.length > 0 ? (
                history.map((rec) => (
                    <div key={rec.id} className="history-item">
                        <img src={rec.imageUrl} alt={rec.artistName} className="history-artist-image" />
                        <div className="history-artist-details">
                            <h3>{rec.artistName}</h3>
                            <p>{rec.reason}</p>
                            <textarea
                                value={rec.feedback || ''}
                                onChange={(e) => API.submitRecommendationFeedback(localStorage.getItem('jwt'), { recommendationId: rec.id, feedback: e.target.value })}
                                placeholder="Leave your feedback here"
                            />
                        </div>
                    </div>
                ))
            ) : (
                <p>No recommendation history available.</p>
            )}
        </div>
    );
}

export default RecommendationHistory;
