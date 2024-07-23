import React, { useState, useEffect } from 'react';
import './settings.css';
import API from '../../api';

const DEFAULT_PROFILE_PICTURE_URL = '/src/assets/default_pfp.jpg';

function Settings({ userInfo, handleUpdateProfile, handleUpdatePassword, handleLogout }) {
    const [username, setUsername] = useState(userInfo.username || '');
    const [email, setEmail] = useState(userInfo.email || '');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE_URL);

    useEffect(() => {
        if (userInfo.username !== undefined) setUsername(userInfo.username);
        if (userInfo.email !== undefined) setEmail(userInfo.email);
        if (userInfo.id) {
            fetchProfilePicture(userInfo.id);
        }
    }, [userInfo]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        await handleUpdateProfile({ username, email });

        if (selectedFile) {
            const formData = new FormData();
            formData.append('profilePicture', selectedFile);

            try {
                const response = await API.uploadProfilePicture(formData);
                if (response.message) {
                    alert('Profile picture uploaded successfully');
                    fetchProfilePicture(userInfo.id);
                } else {
                    alert('Failed to upload profile picture');
                }
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                alert('Failed to upload profile picture');
            }
        }

        alert('Your profile has been updated. You will be logged out to re-login with updated details.');
        handleLogout();
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        handleUpdatePassword({ currentPassword: password, newPassword, confirmPassword });
    };

    const fetchProfilePicture = async (userId) => {
        try {
            const response = await API.fetchProfilePicture(userId);
            if (response.type.includes('image')) {
                setProfilePictureUrl(URL.createObjectURL(response));
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            setProfilePictureUrl(DEFAULT_PROFILE_PICTURE_URL); // Fallback to default picture if there's an error
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-section">
                <h2>Edit Profile</h2>
                <form onSubmit={handleProfileSubmit}>
                    <label>
                        Username:
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </label>
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>
                    <label>
                        Profile Picture:
                        <input type="file" onChange={handleFileChange} className='upload-button' />
                    </label>
                    <div className="profile-picture-preview-container">
                        <img src={profilePictureUrl} alt="Profile" />
                    </div>
                    <button type="submit">Update Profile</button>
                </form>
            </div>
            <div className="settings-section">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordSubmit}>
                    <label>
                        Current Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    <label>
                        New Password:
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </label>
                    <label>
                        Confirm New Password:
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </label>
                    <button type="submit">Change Password</button>
                </form>
            </div>
        </div>
    );
}

export default Settings;
