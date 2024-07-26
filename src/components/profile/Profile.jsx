import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import UserProfilePlaylist from '../userprofileplaylist/UserProfilePlaylist.jsx';
import UserProfileTrending from '../userprofiletrending/UserProfileTrending.jsx';
import SkeletonLoader from '../skeletonloader/SkeletonLoader.jsx';
import './profile.css';
import API from '../../api.js';
import placeholderImg from '/src/assets/default_artist.jpg';

const DEFAULT_PROFILE_PICTURE_URL = '/src/assets/default_pfp.jpg';
const DEFAULT_ARTIST_PICTURE_URL = placeholderImg;
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
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMorePlaylists, setHasMorePlaylists] = useState(true);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const [artistIds, setArtistIds] = useState([]);
  const navigate = useNavigate();

  const handleEditProfileClick = () => {
    navigate('/settings');
  };

  useEffect(() => {
    const fetchProfilePictureAndTaggedSongs = async () => {
      if (!userInfo.id) return;

      try {
        // Fetch Profile Picture
        const response = await API.fetchProfilePicture(userInfo.id);
        if (response.type.includes('image')) {
          setProfilePictureUrl(URL.createObjectURL(response));
        }

        // Fetch Tagged Songs
        const songs = await API.fetchTaggedSongs();
        const artistIdsWithDate = songs
          .filter(song => song.artistId)
          .map(song => ({ artistId: song.artistId, taggedAt: song.taggedAt }));

        setArtistIds(artistIdsWithDate);
      } catch (error) {
        console.error('Error fetching profile picture or tagged songs:', error);
        setProfilePictureUrl(DEFAULT_PROFILE_PICTURE_URL);
      }
    };

    fetchProfilePictureAndTaggedSongs();
  }, [userInfo]);

  useEffect(() => {
    const fetchArtistImagesAndPlaylists = async () => {
      setLoadingArtists(true);
      setLoadingPlaylists(true);

      try {
        // Fetch Artist Images
        if (artistIds.length > 0) {
          const artistIdsOnly = artistIds.map(artist => artist.artistId);
          const data = await API.fetchArtistImages(artistIdsOnly.join(','));
          if (data.error) {
            console.warn('Rate limited, using default artist images');
            const defaultArtists = artistIds.map(({ artistId }) => ({ id: artistId, name: 'Unknown Artist', images: [{ url: DEFAULT_ARTIST_PICTURE_URL }] }));
            setFollowedArtists(defaultArtists);
            setDisplayedArtists(defaultArtists.slice(0, ARTIST_BATCH_SIZE));
            setHasMoreArtists(defaultArtists.length > ARTIST_BATCH_SIZE);
          } else {
            const artists = artistIds.map(({ artistId, taggedAt }) => {
              const artistData = data.artists.find(artist => artist.id === artistId);
              return {
                id: artistData.id,
                name: artistData.name,
                images: artistData.imageUrl ? [{ url: artistData.imageUrl }] : [{ url: DEFAULT_ARTIST_PICTURE_URL }],
                taggedAt
              };
            });

            artists.sort((a, b) => new Date(b.taggedAt) - new Date(a.taggedAt)); // Sort by newest first

            setFollowedArtists(artists);
            setDisplayedArtists(artists.slice(0, ARTIST_BATCH_SIZE));
            setHasMoreArtists(artists.length > ARTIST_BATCH_SIZE);
          }
        } else {
          setLoadingArtists(false);
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
        console.error('Error fetching artist images or playlists:', error);
      } finally {
        setLoadingArtists(false);
        setLoadingPlaylists(false);
      }
    };

    if (artistIds.length > 0) {
      fetchArtistImagesAndPlaylists();
    }
  }, [artistIds]);

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
            {loadingPlaylists ? (
              <SkeletonLoader type="playlist" />
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
            {loadingArtists ? (
              <SkeletonLoader type="artist" />
            ) : (
              <>
                {displayedArtists.map(artist => (
                  <UserProfileTrending
                    key={artist.id}
                    name={artist.name}
                    image={artist.images[0]?.url || placeholderImg}
                  />
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
