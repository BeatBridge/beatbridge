import React, { useEffect, useState } from 'react';
import API from '../../api.js';
import './friends.css';

const DEFAULT_PROFILE_PICTURE_URL = '/src/assets/default_pfp.jpg';

function FriendsSidebar({ onChatClick }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.fetchUsers();
        const usersWithProfilePictures = await Promise.all(response.map(async (user) => {
          try {
            const pictureResponse = await API.fetchProfilePicture(user.id);
            if (pictureResponse.type.includes('image')) {
              user.profilePicture = URL.createObjectURL(pictureResponse);
            } else {
              user.profilePicture = DEFAULT_PROFILE_PICTURE_URL;
            }
          } catch (error) {
            console.error(`Error fetching profile picture for user ${user.id}:`, error);
            user.profilePicture = DEFAULT_PROFILE_PICTURE_URL;
          }
          return user;
        }));
        setUsers(usersWithProfilePictures);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="friends-sidebar">
      <h4>Friends</h4>
      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-card" onClick={() => onChatClick(user)}>
            <img src={user.profilePicture || DEFAULT_PROFILE_PICTURE_URL} alt="Profile" />
            <div className="user-info">
                <div>
                    <h2>{user.username}</h2>
                    <p>{user.email}</p>
                </div>
                <button>Chat</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsSidebar;
