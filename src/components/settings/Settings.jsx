import './settings.css';

function Settings({ userInfo, handleUpdateProfile, handleUpdatePassword, handleLogout }) {
    const [username, setUsername] = useState(userInfo.username || '');
    const [email, setEmail] = useState(userInfo.email || '');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (userInfo.username !== undefined) setUsername(userInfo.username);
        if (userInfo.email !== undefined) setEmail(userInfo.email);
    }, [userInfo]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        await handleUpdateProfile({ username, email });
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
