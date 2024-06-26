import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './login.css';
import logoImg from '/beatbridge_logo.png';

const Login = () => {
    const [passwordType, setPasswordType] = useState('password');
    const [capsLockWarning, setCapsLockWarning] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordType(passwordType === 'password' ? 'text' : 'password');
    };

    const handleCapsLock = (event) => {
        setCapsLockWarning(event.getModifierState('CapsLock'));
    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-md-2'>
                    <NavLink to="/" className="logo" title='elcruzo_logo'>
                        <div className='parent-logo-container'>
                            <div className='logo-container'>
                                <img src={logoImg} alt="logo img-fluid" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>
            </div>

            <div className='row mt-4'>
                <div className='col-md-6 col-lg-4 mx-auto'>
                    <h4 className="text-left">Welcome Back! Join thousands of users</h4>
                    <h5 className="text-left">
                        New to Beatbridge? <Link to='/' className="redirect">Create an account</Link>
                    </h5>
                    <br />

                    <form action="" method="get" spellCheck="false">
                        <div className="textfield mb-3">
                            <label htmlFor="username">Username</label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fa-solid fa-user"></i></span>
                                </div>
                                <input className="form-control" type="text" name="username" required />
                            </div>
                        </div>
                        <div className="textfield mb-3">
                            <label htmlFor="password">Password</label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fa-solid fa-lock"></i></span>
                                </div>
                                <input
                                    className="form-control"
                                    type={passwordType}
                                    name="password"
                                    id="psw"
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                    title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                                    required
                                    onKeyUp={handleCapsLock}
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text cursor-pointer" onClick={togglePasswordVisibility}>
                                        <i className={`far ${passwordType === 'password' ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                    </span>
                                </div>
                            </div>
                            {capsLockWarning && <h5 id="capslocktext" className="text-danger mt-1">WARNING! Caps lock is ON</h5>}
                        </div>
                        <h5 className="text-right"><a href="#">Forgot Password!</a></h5>
                        <div className="btn-body">
                            <input className="btn btn-primary w-100" type="submit" value="Sign In" />
                        </div>
                    </form>
                </div>
                <div className="col-md-6 col-lg-8 d-none d-md-block">
                    <img src="../../../src/auth_graphics_young people looking at gadgets.svg" alt="join us at beatbridge" className="img-fluid" />
                </div>
            </div>
        </div>
    )
}

export default Login;
