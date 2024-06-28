import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './signup.css';
import logoImg from '/beatbridge_logo.png';

function SignUp() {
    const [passwordType, setPasswordType] = useState('password');
    const [capsLockWarning, setCapsLockWarning] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordType(passwordType === 'password' ? 'text' : 'password');
    };

    const handleCapsLock = (event) => {
        setCapsLockWarning(event.getModifierState('CapsLock'));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;

            const response = await fetch(`${backendUrlAccess}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: formData.username,
                    email: formData.email,
                    password: formData.password })
            });

            console.log('User signed up successfully:', response.data);
            navigate('/l/dashbaord');
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };

    return (
        <div className='container'>
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

            <div className='row mt-4'>
                <div className='col-md-6 col-lg-4 mx-auto'>
                    <h5 className="welcome1">Be a part of the family!</h5>
                    <h6 className="welcome2">
                        Already a member? <Link to='/login' className="redirect">Login</Link>
                    </h6>
                    <br />

                    <form onSubmit={handleSubmit} spellCheck="false">
                        <div className="textfield mb-3">
                            <label htmlFor="username">Username</label>
                            <span><i className="fa-solid fa-user user-icon"></i></span>
                            <input
                                className="form-control user-field"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="textfield mb-3">
                            <label htmlFor="email">Email</label>
                            <span><i className='fa-solid fa-envelope email-icon'></i></span>
                            <input
                                className="form-control email-field"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="textfield mb-3">
                            <label htmlFor="password">Password</label>
                            <span><i className="fa-solid fa-lock lock-icon"></i></span>
                            <input
                                className="form-control pwd-field"
                                type={passwordType}
                                name="password"
                                id="psw"
                                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                onKeyUp={handleCapsLock}
                            />
                            <span className="eye-icon" onClick={togglePasswordVisibility}>
                                <i className={`far ${passwordType === 'password' ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </span>
                            {capsLockWarning && <h5 id="capslocktext" className="text-danger mt-1">WARNING! Caps lock is ON</h5>}
                        </div>
                        <div className="textfield mb-3">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <span><i className="fa-solid fa-lock lock-icon"></i></span>
                            <input
                                className="form-control pwd-field"
                                type={passwordType}
                                name="confirmPassword"
                                id="confirmPsw"
                                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                onKeyUp={handleCapsLock}
                            />
                            <span className="eye-icon" onClick={togglePasswordVisibility}>
                                <i className={`far ${passwordType === 'password' ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </span>
                            {capsLockWarning && <h5 id="capslocktext" className="text-danger mt-1">WARNING! Caps lock is ON</h5>}
                        </div>
                        <h5 className="text-right"><a href="#">Forgot Password!</a></h5>
                        <div className="btn-body">
                            <input className="btn btn-primary w-100" type="submit" value="Sign Up" />
                        </div>
                    </form>
                </div>
                <div className="col-md-6 col-lg-8 d-none d-md-block">
                    <img src="../../../src/auth_graphics_young people looking at gadgets.svg" alt="join us at beatbridge" className="img-fluid" />
                </div>
            </div>
        </div>
    );
}

export default SignUp;
