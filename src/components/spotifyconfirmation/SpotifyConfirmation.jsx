import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api.js';

const SpotifyConfirmation = () => {
    const navigate = useNavigate();
    const token = new URLSearchParams(window.location.search).get('token');

    useEffect(() => {
        const confirmSpotifyLogin = async () => {
            try {
                const response = await API.verifySpotify(token);
                if (response.status === 'success') {
                    navigate('/l/dashboard');
                } else {
                    // Handle failure (e.g., show an error message)
                    navigate('/error');
                }
            } catch (error) {
                console.error('Error during Spotify confirmation:', error);
                navigate('/error');
            }
        };
        confirmSpotifyLogin();
    }, [token, navigate]);

    return (
        <div>
            <h1>Confirming your Spotify Login...</h1>
        </div>
    );
};

export default SpotifyConfirmation;
