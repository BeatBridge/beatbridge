import React from 'react';
import './userprofiletrending.css';
import placeholderImg from '/src/assets/default_artist.jpg';

function UserProfileTrending({ name, image }) {
    return (
        <div>
            <div className='t-placeholder-container'>
                <img src={image || placeholderImg} alt="Artist" />
            </div>
            <div className='t-playlist-desc-container'>
                <h4>{name}</h4>
            </div>
        </div>
    );
}

export default UserProfileTrending;
