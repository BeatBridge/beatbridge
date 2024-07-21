import React, {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import UserProfileViral from '../userprofileviral/UserProfileViral.jsx';
import UserProfileTrending from '../userprofiletrending/UserProfileTrending.jsx';
import './profile.css';
import API from '../../api.js';
const DEFAULT_PROFILE_PICTURE_URL = '/src/assets/default_pfp.jpg';

function Profile({ userInfo }) {
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE_URL);

  const navigate = useNavigate();

  const handleEditProfileClick = () => {
    navigate('/settings');
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
        try {
            const response = await API.fetchProfilePicture(userInfo.id);
            if (response.type.includes('image')) {
                setProfilePictureUrl(URL.createObjectURL(response));
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            setProfilePictureUrl(DEFAULT_PROFILE_PICTURE_URL); // Fallback to default picture if there's an error
        }
    };

    if (userInfo.id) {
        fetchProfilePicture();
    }
}, [userInfo]);

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
              <strong>Public Playlist</strong>
            </h2>
            <h5>Show All</h5>
          </div>
          <div className="user-profile-viral-container">
            <UserProfileViral desc="This is Billie Eilish" followerCount="24,534" />
            <UserProfileViral desc="This is J Cole" followerCount="39,768" />
            <UserProfileViral desc="This is Asake" followerCount="10,025" />
            <UserProfileViral desc="This is Taylor Swift" followerCount="330,472" />
            <UserProfileViral desc="This is Burna Boy" followerCount="76,902" />
            <UserProfileViral desc="This is Central Cee" followerCount="102,022" />
          </div>
        </div>
        <div className="user-profile-details-bottom">
          <div className="user-profile-details-buttons">
            <h2>
              <strong>Artists You Follow</strong>
            </h2>
            <h5>Show All</h5>
          </div>
          <div className="user-profile-trending-container">
            <UserProfileTrending name="Asake" />
            <UserProfileTrending name="Billie Eilish" />
            <UserProfileTrending name="Central Cee" />
            <UserProfileTrending name="Metro Boomin" />
            <UserProfileTrending name="PARTYNEXTDOOR" />
            <UserProfileTrending name="Rema" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
