import React from "react";
import './homediscover.css';
import AboutCard from '../aboutcard/AboutCard';

function HomeDiscover () {
    return(
        <div className='about-container'>
            <div className='about-title'>
                <h2>Discover new music at your fingertips!</h2>
            </div>

            <div className="about-card-container-1">
                <AboutCard />
                <AboutCard />
                <AboutCard />
                <AboutCard />
            </div>
            <div className="about-card-container-2">
                <AboutCard />
            </div>
        </div>
    )
}

export default HomeDiscover
