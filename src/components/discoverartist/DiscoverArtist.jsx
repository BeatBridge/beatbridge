import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import './discoverartist.css';
import placeholderImg from '../../assets/default_artist.jpg';

const formatNumberWithCommas = (number) => {
  return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null;
};

function DiscoverArtist({ artist }) {
  const { name, followerCount, imageUrl } = artist || {};
  const formattedFollowers = formatNumberWithCommas(followerCount);

  if (!imageUrl) return null;

  return (
    <div className="discover-artist-container">
      <div className="discover-artist-image">
        <img src={imageUrl || placeholderImg} alt={name || 'Unknown Artist'} />
      </div>
      <div className="discover-artist-desc">
        <div className="discover-artist-desc-details">
          <h3 className="truncate">{name || 'Unknown Artist'}</h3>
          <p>{formattedFollowers !== null ? `${formattedFollowers} Followers` : 'Unknown Followers'}</p>
        </div>
        <div className="discover-artist-desc-play">
          <FontAwesomeIcon icon={faCirclePlay} />
        </div>
      </div>
    </div>
  );
}

export default DiscoverArtist;
