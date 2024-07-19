import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser, FaMusic } from 'react-icons/fa';
import { faHeadphonesSimple, faTag, faChartLine, faGauge, faUserGroup, faWandMagicSparkles, faGear, faMicrochip, faEarthAmericas } from '@fortawesome/free-solid-svg-icons';
import Hamburger from 'hamburger-react';
import logoImg from '/beatbridge_logo.png';
import LSearchForm from '../searchform/LSearchForm.jsx';
import GlobalTop50 from '../globaltop50/GlobalTop50.jsx';
import TaggingForm from '../tagform/TaggingForm.jsx';
import DiscoverGenre from '../discovergenre/DiscoverGenre.jsx';
import discoImg from '../../assets/genres/disco.jpg';
import popImg from '../../assets/genres/pop.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import rockImg from '../../assets/genres/rock.jpg';
import './ldashboard.css';
import './mdashboard.css';

function MobileDashboard({
  userInfo,
  handleLogout,
  isSpotifySignedIn,
  handleTrackClick,
  searchResults,
  selectedTrack,
  showTaggingForm,
  setShowTaggingForm,
  handleTagButtonClick,
  handleCloseTrack,
  handleTag,
  handleSearchResults,
  handleSuggestionClick,
  viral50Global,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSpotifySignedIn && !viral50Global.length) {
        handleSearchResults();
      }
    }, [isSpotifySignedIn, viral50Global, handleSearchResults]);

  return (
    <div className="mobile-dashboard-container">
      <div className="mobile-header">
        <div className="mobile-logo">
          <img src={logoImg} alt="BeatBridge Logo" />
        </div>
        <div className="mobile-user-info">
          <FaUser className="mobile-user-icon" />
          <div className="mobile-user-details">
            <span>{userInfo.username}</span>
            <span>{userInfo.isPremium ? 'Premium' : 'Free'} Subscriber</span>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="hamburger-wrapper">
          <Hamburger toggled={isMenuOpen} toggle={toggleMenu} size={20} />
        </div>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'show' : ''}`} ref={menuRef}>
        <button className="mobile-menu-close" onClick={toggleMenu}>Close</button>
        <NavLink to="/profile" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FaUser />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/l/dashboard" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faGauge} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tags" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faTag} />
          <span>Tags</span>
        </NavLink>
        <NavLink to="/trending" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faChartLine} />
          <span>Trending</span>
        </NavLink>
        <NavLink to="/friends" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faUserGroup} />
          <span>Friends</span>
        </NavLink>
        <NavLink to="/recommended" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          <span>Recommended</span>
        </NavLink>
        <NavLink to="/settings" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faGear} />
          <span>Settings</span>
        </NavLink>
        <NavLink to="/chatbot" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faMicrochip} />
          <span>Chat With AI</span>
        </NavLink>
        <NavLink to="/map" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
          <FontAwesomeIcon icon={faEarthAmericas} />
          <span>Map</span>
        </NavLink>
      </div>

      <div className="mobile-content">
        <LSearchForm onSearchResults={handleSearchResults} onSuggestionClick={handleSuggestionClick} />  {/* Add search form */}

        {selectedTrack && (
          <div className="mobile-track-details">
            <h4>{selectedTrack.name}</h4>
            <p>{selectedTrack.artist}</p>
            {selectedTrack.album.images && selectedTrack.album.images.length > 0 ? (
              <div className="mobile-tag-art-container">
                <img src={selectedTrack.album.images[0].url} alt="Track Art" className="mobile-tag-art" />
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

        {searchResults !== undefined && !selectedTrack && searchResults.length > 0 && (
          <div className="mobile-search-results">
            {searchResults.map((track, index) => (
              <div key={index} className="mobile-search-result" onClick={() => handleTrackClick(track)}>
                <h4>{track.name}</h4>
                <p>{track.artists[0].name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mobile-section">
          <div className="mobile-section-header">
            <h5>
              <FaMusic className="mobile-icon" />
            </h5>
            <h2>Discover Genre</h2>
          </div>

          <div className="mobile-section-content">
            <DiscoverGenre genre_img={discoImg} genre_name="Disco" track_num={120} />
            <DiscoverGenre genre_img={popImg} genre_name="Pop" track_num={180} />
            <DiscoverGenre genre_img={danceImg} genre_name="Dance" track_num={100} />
            <DiscoverGenre genre_img={reggaeImg} genre_name="Reggae" track_num={170} />
            <DiscoverGenre genre_img={rockImg} genre_name="Rock" track_num={200} />
          </div>
        </div>

        <div className="mobile-section">
          <div className="mobile-section-header">
            <h5>
              <FontAwesomeIcon icon={faHeadphonesSimple} className="mobile-icon" />
            </h5>
            <h2>Top 50 Viral Songs</h2>
          </div>

          <div className="mobile-section-content">
            {isSpotifySignedIn ? (
              viral50Global.length > 0 ? (
                <div>
                  <GlobalTop50 tracks={viral50Global.slice(0, 10)} onTrackClick={handleTrackClick} />
                </div>
              ) : (
                <p>No top 50 global songs found.</p>
              )
            ) : (
              <p>Please sign in to Spotify to view this data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileDashboard;
