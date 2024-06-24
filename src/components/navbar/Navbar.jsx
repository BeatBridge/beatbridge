import {React, useRef} from 'react';
import {FaBars, FaTimes} from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import './navbar.css'
import logoImg from '/beatbridge_logo.png';

function Navbar() {
    const navRef = useRef();

    const showNavbar = () => {
        navRef.current.classList.toggle("responsive-nav");
    }

    return (
        <header>
            <NavLink to="/" className="logo" title='elcruzo_logo'>
                <div className='parent-logo-container'>
                    <div className='logo-container'>
                        <img src={logoImg} alt="logo" />
                    </div>
                    <div>BeatBridge</div>
                </div>
            </NavLink>

            <nav className='nav navbar navbar-expand-sm' ref={navRef}>
                <ul className='navbar-nav ml-auto'>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/" activeclassname="active">About Us</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/support" activeclassname="active">Support</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/blog" activeclassname="active">Blog</NavLink>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="https://docs.google.com/document/d/19xVMNChFc0ccuvewNZunGhgSB8Pooy_y7fTLMMFtXCo/edit?usp=sharing">Contact</a>
                    </li>
                    <li>
                        <h3>|</h3>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/signup" activeclassname="active">Sign Up</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/login" activeclassname="active">Log In</NavLink>
                    </li>
                </ul>
                <button className="nav-btn nav-close-btn" onClick={showNavbar}>
                    <FaTimes />
                </button>
            </nav>
            <button className='nav-btn' onClick={showNavbar}>
                <FaBars />
            </button>
        </header>
    )
}

export default Navbar
