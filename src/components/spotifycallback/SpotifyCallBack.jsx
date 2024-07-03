import { useEffect } from 'react';
import { useSearchParams, NavLink, useFetcher } from 'react-router-dom';
import './spotify_call_back.css';
import logoImg from '/beatbridge_logo.png';
import API from '../../api.js';

function SpotifyCallBack () {
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect (() => {
        API.sendCode(searchParams.get("code"), localStorage.getItem("jwt"));
        window.location.href = "/l/dashboard/"
    }, [])

    return(
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
                    <h1>Logging you in...</h1>
                </div>
            </div>
        </div>
    )
}

export default SpotifyCallBack
