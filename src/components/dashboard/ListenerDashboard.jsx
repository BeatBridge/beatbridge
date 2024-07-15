import React, { useEffect } from 'react';
import LSearchForm from '../searchform/LSearchForm.jsx';
import { FaMusic } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphonesSimple } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discovergenre/DiscoverGenre.jsx';
import discoImg from '../../assets/genres/disco.jpg';
import popImg from '../../assets/genres/pop.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import rockImg from '../../assets/genres/rock.jpg';
import Viral50Global from '../viral50global/Viral50Global.jsx';
import './ldashboard.css';

function ListenerDashboard({
  handleSearchResults,
  handleSuggestionClick,
  handleTrackClick,
  isSpotifySignedIn,
  viral50Global,
  userInfo,
}) {
  useEffect(() => {
    if (isSpotifySignedIn && !viral50Global.length) {
      handleSearchResults();
    }
  }, [isSpotifySignedIn, viral50Global, handleSearchResults]);

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
          <h2>Discover Genre</h2>
        </div>

        <div className="l-discover-genre-bottom">
          <DiscoverGenre genre_img={discoImg} genre_name="Disco" track_num={120} />
          <DiscoverGenre genre_img={popImg} genre_name="Pop" track_num={180} />
          <DiscoverGenre genre_img={danceImg} genre_name="Dance" track_num={100} />
          <DiscoverGenre genre_img={reggaeImg} genre_name="Reggae" track_num={170} />
          <DiscoverGenre genre_img={rockImg} genre_name="Rock" track_num={200} />
        </div>
      </div>
      <div>
        <div className="l-top-music-top">
          <h5>
            <FontAwesomeIcon icon={faHeadphonesSimple} className="l-top-music-icon-header" />
          </h5>
          <h2>Top 50 Viral Songs</h2>
        </div>

        <div>
          {isSpotifySignedIn ? (
            viral50Global.length > 0 ? (
              <div>
                <Viral50Global tracks={viral50Global.slice(0, 10)} onTrackClick={handleTrackClick} />
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
  );
}

export default ListenerDashboard;
