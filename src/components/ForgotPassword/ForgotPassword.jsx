import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './forgotpassword.css';
import logoImg from '/beatbridge_logo.png';
import API from '../../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.forgotPassword({ email });
            if (response.error) {
                setMessage('Error sending password reset email. Please try again.');
            } else {
                setMessage('Password reset email sent successfully. Please check your email.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error sending password reset email. Please try again.');
        }
    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-md-2'>
                    <NavLink to="/" className="auth-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='auth-logo-container'>
                                <img src={logoImg} alt="logo img-fluid"/>
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>
            </div>

            <div className='row'>
                <div className='col-md-6 col-lg-4 mx-auto'>
                    <h5>Forgot Password</h5>
                    {message && <p>{message}</p>}
                    <form onSubmit={handleSubmit} spellCheck="false">
                        <div className="textfield mb-3">
                            <label htmlFor="email">Email</label>
                            <input
                                className="form-control form-format-2"
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="btn-body">
                            <input className="btn btn-primary w-100" type="submit" value="Send Reset Link" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
