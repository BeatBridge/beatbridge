import { NavLink } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import './map.css';

function Map () {
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
                    <h1>This screen shows a realtime genre map based on which artistes are trending right now.</h1>
                </div>
            </div>
        </div>
    )
}

export default Map;
