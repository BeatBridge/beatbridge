import React, { useState, useEffect } from 'react';
import LSearchForm from '../searchform/LSearchForm.jsx';
import { FaMusic } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphonesSimple } from '@fortawesome/free-solid-svg-icons';
import DiscoverArtist from '../discoverartist/DiscoverArtist.jsx';
import Viral50Global from '../viral50global/Viral50Global.jsx';
import ShimmerLoader from '../shimmerloader/ShimmerLoader.jsx';
import './ldashboard.css';
import API from '../../api.js';

const ARTIST_BATCH_SIZE = 10;

function ListenerDashboard({
  handleSearchResults,
  handleSuggestionClick,
  handleTrackClick,
  isSpotifySignedIn,
  viral50Global,
  userInfo,
  loading
}) {
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const [artistSkip, setArtistSkip] = useState(0);

  useEffect(() => {
    if (isSpotifySignedIn && viral50Global.length === 0) {
      handleSearchResults();
    }
  }, [isSpotifySignedIn, viral50Global, handleSearchResults]);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoadingArtists(true);
    try {
      const newArtists = await API.fetchLeastPopularArtists(artistSkip, ARTIST_BATCH_SIZE);
      if (newArtists.length < ARTIST_BATCH_SIZE) {
        setHasMoreArtists(false);
      }
      setArtists(prevArtists => [...prevArtists, ...newArtists]);
      setArtistSkip(prevSkip => prevSkip + ARTIST_BATCH_SIZE);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoadingArtists(false);
    }
  };

  return (
    <div className='l-center-bar'>
      <div>
        <LSearchForm onSearchResults={handleSearchResults} onSuggestionClick={handleSuggestionClick} />
      </div>
      <div>
        <div className="l-discover-genre-top">
          <h5>
            <FaMusic className="l-discover-genre-music-icon" />
          </h5>
          <div className="l-discover-header">
            <h2>Discover Artists</h2>
            {hasMoreArtists && <h5 onClick={fetchArtists}>Show More</h5>}
          </div>
        </div>
        <div className="l-discover-artist-container">
          {loadingArtists ? (
            <ShimmerLoader type="artist" count={ARTIST_BATCH_SIZE} className="ld-shimmer" />
          ) : (
            artists.map(artist => (
              <DiscoverArtist key={artist.id} artist={artist} />
            ))
          )}
        </div>
      </div>
      <div>
        <div className="l-top-music-top">
          <h5>
            <FontAwesomeIcon icon={faHeadphonesSimple} className="l-top-music-icon-header" />
          </h5>
          <h2>Top 10 Viral Songs</h2>
        </div>
        <div>
          {isSpotifySignedIn ? (
            loading ? (
              <ShimmerLoader type="track" count={10} />
            ) : (
              viral50Global.length > 0 ? (
                <Viral50Global tracks={viral50Global.slice(0, 10)} onTrackClick={handleTrackClick} loading={loading} />
              ) : (
                <p>No top 10 global songs found.</p>
              )
            )
          ) : (
            <p>Please sign in to Spotify to view this data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListenerDashboard;
