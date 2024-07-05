import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, useParams } from 'react-router-dom';
import API from '../../api.js';
import './emailverification.css';
import logoImg from '/beatbridge_logo.png';

function EmailVerification() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('Verifying...');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await API.verifyEmail(token);
                if (response.error) {
                    setVerificationStatus('Verification failed. Please try again.');
                } else {
                    setVerificationStatus('Email verified successfully! Redirecting to login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                setVerificationStatus('An error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [token, navigate]);

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
                    <h1>{verificationStatus}</h1>
                </div>
            </div>
        </div>
    );
}

export default EmailVerification;
