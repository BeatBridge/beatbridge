import React from 'react';
import './aboutcard.css';

function AboutCard({ name, description, image }) {
    return (
        <div className="about-card">
            <div className="example-img">
                {image ? <img src={image} alt={`${name}`} /> : <div className="placeholder-img" />}
            </div>
            <div className="example-desc">
                <h3>{name}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default AboutCard;
