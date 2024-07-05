import React from 'react';
import { FaEllipsisV, FaUser } from 'react-icons/fa';
import './globaltop50.css';

const getAllSongs = (resJSON) => {
  let allSongs = [];
  if (!resJSON) return [];

  for (let i = 0; i < resJSON.length; i++) {
    const song = {
      "index": i,
      "name": resJSON[i].track.name,
      "artist": resJSON[i].track.artists ? resJSON[i].track.artists[0].name : "No Artist",
      "images": resJSON[i].track.album.images,
    };
    allSongs = [...allSongs, song];
  }
  return allSongs;
};

const TrackCard = ({ track }) => {
  return (
    <div className='top-artist-container'>
      <div className='top-artist-sub-container'>
          <div className='top-artist-img'>
            {track.images && track.images.length > 0 ? (
              <img src={track.images[0].url} alt="Album Cover" className='l-top-artist-icon' />
            ) : (
              <FaUser className='l-top-artist-icon' />
            )}
          </div>
          <div className='top-artist-info'>
              <h4>{track.artist}</h4>
              <h6>{track.name}</h6>
          </div>
      </div>
      <div className='ta-ellipsis-container'>
          <FaEllipsisV className='ta-ellipsis'/>
      </div>
    </div>
  );
};

const GlobalTop50 = ({ tracks }) => {
  const allSongs = getAllSongs(tracks);
  return (
    <>
      {allSongs.length > 0 ? (
        allSongs.map((track, index) => (
          <TrackCard key={index} track={track} />
        ))
      ) : (
        <p>No tracks available.</p>
      )}
    </>
  );
};

export default GlobalTop50;
