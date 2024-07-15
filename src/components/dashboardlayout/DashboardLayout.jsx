// DashboardLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaBell, FaUser, FaTag } from 'react-icons/fa';
import { faEarthAmericas, faChartLine, faGauge, faGear, faMicrochip, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import logoImg from '/beatbridge_logo.png';
import SpotifyOAuth from '../spotifyoauth/SpotifyOAuth.jsx';
import GlobalTop50 from '../globaltop50/GlobalTop50.jsx';
import TaggingForm from '../tagform/TaggingForm.jsx';
import '../dashboard/ldashboard.css';

function DashboardLayout({
  userInfo,
  handleLogout,
  isSpotifySignedIn,
  globalTop50,
  handleTrackClick,
  searchResults,
  selectedTrack,
  showTaggingForm,
  handleTagButtonClick,
  handleCloseTrack,
  handleTag,
}) {
  const getNavLinkClass = ({ isActive }) => (isActive ? 'menu active' : 'menu');

  return (
    <div className="l-dashbaord-container">
      <div className="row">
        {/* LEFT COLUMN */}
        <div className="l-left-sidebar col-md-2">
          <NavLink to="/" className="l-logo" title="beatbridge_logo">
            <div className="parent-logo-container">
              <div className="logo-container">
                <img src={logoImg} alt="logo img-fluid" />
              </div>
              <div>BeatBridge</div>
            </div>
          </NavLink>

          <div className="menu-items-container">
            <h4>Menu</h4>
            <hr />

            <div className="l-menu-items">
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/profile' })}>
                <FaUser className="menu-icon" />
                <NavLink to="/profile" className="menu-item">
                  <h5>Profile</h5>
                </NavLink>
              </div>
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/l/dashboard' })}>
                <FontAwesomeIcon icon={faGauge} className="menu-icon" />
                <NavLink to="/l/dashboard" className="menu-item">
                  <h5>Dashboard</h5>
                </NavLink>
              </div>
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/tags' })}>
                <FaTag className="menu-icon" />
                <NavLink to="/tags" className="menu-item">
                  <h5>Tags</h5>
                </NavLink>
              </div>
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/friends' })}>
                <FontAwesomeIcon icon={faUserGroup} className="menu-icon" />
                <NavLink to="/friends" className="menu-item">
                  <h5>Friends</h5>
                </NavLink>
              </div>
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/trending' })}>
                <FontAwesomeIcon icon={faChartLine} className="menu-icon" />
                <NavLink to="/trending" className="menu-item">
                  <h5>Trending</h5>
                </NavLink>
              </div>
            </div>
          </div>

          <div>
            <h4>Help</h4>
            <hr />

            <div className="l-menu-items">
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/settings' })}>
                <FontAwesomeIcon icon={faGear} className="menu-icon" />
                <NavLink to="/settings" className="menu-item">
                  <h5>Settings</h5>
                </NavLink>
              </div>
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/chatbot' })}>
                <FontAwesomeIcon icon={faMicrochip} className="menu-icon" />
                <NavLink to="/chatbot" className="menu-item">
                  <h5>Chat With AI</h5>
                </NavLink>
              </div>
              <div className={getNavLinkClass({ isActive: window.location.pathname === '/map' })}>
                <FontAwesomeIcon icon={faEarthAmericas} className="menu-icon" />
                <NavLink to="/map" className="menu-item">
                  <h5>Map</h5>
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="col-md-7 scrollable-column">
          <Outlet />
        </div>

        {/* RIGHT COLUMN */}
        <div className="l-right-sidebar col-md-3">
          <div className="l-right-sidebar-top">
            <div className="l-right-sidebar-user-info">
              <div className="l-dashboard-profile-container">
                <FaUser className="l-dash-user-icon" />
              </div>

              <div className="l-dashboard-user-name">
                <h4>Welcome, {userInfo.username}</h4>
                <p>{userInfo.isPremium ? 'Premium' : 'Free'} Subscriber</p>
                <SpotifyOAuth isSpotifySignedIn={isSpotifySignedIn} />
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
            <div className="l-bell-icon-container">
              <FaBell className="l-dash-bell-icon" />
            </div>
          </div>

          <div>
            <h4 className="l-top-artist-column">Global Top 50</h4>
            {isSpotifySignedIn ? (
              globalTop50.length !== undefined ? (
                <div>
                  <GlobalTop50 tracks={globalTop50.slice(0, 3)} onTrackClick={handleTrackClick} />
                </div>
              ) : (
                <p>No top 50 artists found.</p>
              )
            ) : (
              <p>Please sign in to Spotify to view this data.</p>
            )}
          </div>

          <div>
            {selectedTrack && (
              <div className="selected-track-details">
                <h4>{selectedTrack.name}</h4>
                <p>{selectedTrack.artist}</p>
                {selectedTrack.album.images && selectedTrack.album.images.length > 0 ? (
                  <div className="tag-art-container">
                    <img src={selectedTrack.album.images[0].url} alt="Track Art" className="tag-art" />
                  </div>
                ) : (
                  <div>No image available</div>
                )}
                <button className="btn btn-primary mt-2" onClick={handleTagButtonClick}>
                  Tag
                </button>
                <button className="btn btn-secondary mt-2" onClick={handleCloseTrack}>
                  Close
                </button>
                {showTaggingForm && (
                  <TaggingForm song={selectedTrack} onTag={handleTag} onClose={() => setShowTaggingForm(false)} />
                )}
              </div>
            )}
            {!selectedTrack && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((track, index) => (
                  <div key={index} className="search-result" onClick={() => handleTrackClick(track)}>
                    <h4>{track.name}</h4>
                    <p>{track.artists[0].name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
