import { NavLink } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import './favourites.css';

function Favourites () {
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
                    <h1>In this screen, you as an artist can find songs from other artistes that you like.</h1>
                </div>
            </div>
        </div>
    )
}

export default Favourites;
