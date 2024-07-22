import React, { useState } from 'react';
import API from '../../api.js';
import './forgotpassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.forgotPassword({ email });
            if (response.error) {
                setMessage(response.error.message);
            } else {
                setMessage('Password reset link has been sent to your email.');
            }
        } catch (error) {
            console.error('Error requesting password reset:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="textfield mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                        className="form-control email-field"
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="btn-body">
                    <input className="btn btn-primary w-100" type="submit" value="Reset Password" />
                </div>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}

export default ForgotPassword;
