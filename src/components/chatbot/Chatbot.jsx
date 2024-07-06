import { NavLink } from 'react-router-dom';
import logoImg from '/beatbridge_logo.png';
import './chatbot.css';

function Chatbot () {
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
                    <h1>In this screen, you can ask anything to a chatbot built with Llama.</h1>
                </div>
            </div>
        </div>
    )
}

export default Chatbot;
