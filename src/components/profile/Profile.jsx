import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import UserProfilePlaylist from '../userprofileplaylist/UserProfilePlaylist.jsx';
import UserProfileTrending from '../userprofiletrending/UserProfileTrending.jsx';
import './profile.css';
import API from '../../api.js';

const DEFAULT_PROFILE_PICTURE_URL = '/src/assets/default_pfp.jpg';
const PLAYLIST_BATCH_SIZE = 7;
const ARTIST_BATCH_SIZE = 6;

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function Profile({ userInfo }) {
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE_URL);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [displayedPlaylists, setDisplayedPlaylists] = useState([]);
  const [displayedArtists, setDisplayedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMorePlaylists, setHasMorePlaylists] = useState(true);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const navigate = useNavigate();

  const handleEditProfileClick = () => {
    navigate('/settings');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo.id) return;

      try {
        // Fetch Profile Picture
        const response = await API.fetchProfilePicture(userInfo.id);
        if (response.type.includes('image')) {
          setProfilePictureUrl(URL.createObjectURL(response));
        }

        // Fetch Tagged Songs and Artist Images
        const songs = await API.fetchTaggedSongs();

        // Ensure artistId is part of the song object
        const artistIds = [...new Set(songs.map(song => song.artistId))].filter(id => id);

        if (artistIds.length > 0) {
          const artistData = await API.fetchArtistImages(artistIds);
          if (artistData && artistData.artists) {
            setFollowedArtists(artistData.artists);
            setDisplayedArtists(artistData.artists.slice(0, ARTIST_BATCH_SIZE));
            setHasMoreArtists(artistData.artists.length > ARTIST_BATCH_SIZE);
          } else {
            console.error('Invalid artist data format', artistData);
          }
        }

        // Fetch Playlists
        const playlistsData = await API.fetchPlaylists();
        const playlistsWithFollowers = await Promise.all(
          playlistsData.map(async (playlist) => {
            try {
              const followersData = await API.fetchPlaylistFollowers(playlist.spotifyId);
              return { ...playlist, followerCount: followersData.followerCount };
            } catch (error) {
              console.error(`Error fetching followers for playlist ${playlist.spotifyId}:`, error);
              return { ...playlist, followerCount: 0 };
            }
          })
        );

        setPlaylists(playlistsWithFollowers);
        setDisplayedPlaylists(playlistsWithFollowers.slice(0, PLAYLIST_BATCH_SIZE));
        setHasMorePlaylists(playlistsWithFollowers.length > PLAYLIST_BATCH_SIZE);
      } catch (error) {
        console.error('Error fetching profile picture, tagged songs, or artist images:', error);
        setProfilePictureUrl(DEFAULT_PROFILE_PICTURE_URL); // Fallback to default picture if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  const handleShowMorePlaylistsClick = () => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      const newDisplayedCount = displayedPlaylists.length + PLAYLIST_BATCH_SIZE;
      setDisplayedPlaylists(playlists.slice(0, newDisplayedCount));
      setHasMorePlaylists(newDisplayedCount < playlists.length);
      setLoadMoreLoading(false);
    }, 500); // Simulating network delay
  };

  const handleShowMoreArtistsClick = () => {
    setLoadMoreLoading(true);
    setTimeout(() => {
      const newDisplayedCount = displayedArtists.length + ARTIST_BATCH_SIZE;
      setDisplayedArtists(followedArtists.slice(0, newDisplayedCount));
      setHasMoreArtists(newDisplayedCount < followedArtists.length);
      setLoadMoreLoading(false);
    }, 500); // Simulating network delay
  };

  return (
    <div>
      <div className="profile-details">
        <div className="profile-sub-details">
          <div className="profile-pic">
            <img src={profilePictureUrl} alt="Profile" className="profile-picture" />
          </div>
          <div>
            <h1>{userInfo.username}</h1>
            <h3>
              <strong>Email:</strong> {userInfo.email}
            </h3>
            <h3>
              <strong>Subscription:</strong> {userInfo.isPremium ? 'Premium' : 'Free'}
            </h3>
          </div>
        </div>
        <div className="edit-profile-buttons">
          <div className="edit-profile-icon-container" onClick={handleEditProfileClick}>
            <FontAwesomeIcon icon={faPenToSquare} className="edit-profile-icon" />
          </div>
          <div className="edit-profile-icon-container">
            <FontAwesomeIcon icon={faShareNodes} className="edit-profile-icon" />
          </div>
        </div>
      </div>
      <div className="user-profile-details">
        <div className="user-profile-details-top">
          <div className="user-profile-details-buttons">
            <h2>
              <strong>Featured Playlists</strong>
            </h2>
            <h5>Show All</h5>
          </div>
          <div className="user-profile-viral-container">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                {displayedPlaylists.map(playlist => (
                  <UserProfilePlaylist
                    key={playlist.id}
                    desc={playlist.name}
                    followerCount={formatNumberWithCommas(playlist.followerCount || 0)}
                    image={playlist.images[0] ? playlist.images[0].url : null}
                  />
                ))}
                {hasMorePlaylists && (
                  <button className="show-more-button" onClick={handleShowMorePlaylistsClick} disabled={loadMoreLoading}>
                    {loadMoreLoading ? 'Loading...' : 'Show More'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="user-profile-details-bottom">
          <div className="user-profile-details-buttons">
            <h2>
              <strong>Artists You Tagged</strong>
            </h2>
            <h5>Show All</h5>
          </div>
          <div className="user-profile-trending-container">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                {displayedArtists.map(artist => (
                  <UserProfileTrending key={artist.id} name={artist.name} image={artist.images[0]?.url} />
                ))}
                {hasMoreArtists && (
                  <button className="show-more-button" onClick={handleShowMoreArtistsClick} disabled={loadMoreLoading}>
                    {loadMoreLoading ? 'Loading...' : 'Show More'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
