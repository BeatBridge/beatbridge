import React, { useState, useEffect, useMemo } from 'react';
import { FaEllipsisV, FaUser } from 'react-icons/fa';
import './globaltop50.css';
import ShimmerLoader from '../shimmerloader/ShimmerLoader.jsx'; // Import ShimmerLoader
import API from '../../api.js';

const getAllSongs = (resJSON) => {
  let allSongs = [];
  if (!resJSON) return [];

  for (let i = 0; i < resJSON.length; i++) {
    const song = {
      "index": i,
      "name": resJSON[i].track.name,
      "artist": resJSON[i].track.artists ? resJSON[i].track.artists[0].name : "No Artist",
      "artistId": resJSON[i].track.artists ? resJSON[i].track.artists[0].id : null,
      "albumImages": resJSON[i].track.album.images,
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
          {track.artistImage ? (
            <img src={track.artistImage} alt="Artist" className='l-top-artist-icon' />
          ) : (
            <FaUser className='l-top-artist-icon' />
          )}
        </div>
        <div className='top-artist-info'>
          <h4 className='truncate'>{track.artist}</h4>
          <h6 className='truncate'>{track.name}</h6>
        </div>
      </div>
      <div className='ta-ellipsis-container'>
        <FaEllipsisV className='ta-ellipsis'/>
      </div>
    </div>
  );
};

const GlobalTop50 = ({ tracks, loading }) => {
  const [songs, setSongs] = useState([]);
  const [artistImages, setArtistImages] = useState({});

  const artistIds = useMemo(() => {
    const allSongs = getAllSongs(tracks);
    setSongs(allSongs);
    return allSongs.map(song => song.artistId).filter(id => id).join(',');
  }, [tracks]);

  useEffect(() => {
    if (artistIds) {
      fetchArtistImages(artistIds);
    }
  }, [artistIds]);

  const fetchArtistImages = async (artistIds) => {
    try {
      const response = await API.fetchArtistImages(artistIds);
      const images = response.artists.reduce((acc, artist) => {
        acc[artist.id] = artist.images[0] ? artist.images[0].url : null;
        return acc;
      }, {});
      setArtistImages(images);
    } catch (error) {
      console.error('Error fetching artist images:', error);
    }
  };

  if (loading) {
    return <ShimmerLoader type="global-top" count={10} />;
  }

  return (
    <>
      {songs.length > 0 ? (
        songs.map((track, index) => (
          <TrackCard key={index} track={{ ...track, artistImage: artistImages[track.artistId] }} />
        ))
      ) : (
        <p>No tracks available.</p>
      )}
    </>
  );
};

export default GlobalTop50;
