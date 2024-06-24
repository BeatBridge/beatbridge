import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import "./l_dashboard.css";
import logoImg from '/beatbridge_logo.png';
import LSearchForm from '../searchform/LSearchForm';
import { FaBell, FaHeart, FaMusic, FaTag, FaUser, FaUserGraduate } from 'react-icons/fa';
import TopArtistCard from '../top_artist_card/TopArtistCard';
import { faGauge, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discover_genre/DiscoverGenre';
import discoImg from '../../../assets/genres/disco.jpg';
import popImg from '../../../assets/genres/pop.jpg';
import danceImg from '../../../assets/genres/dance.jpeg';
import reggaeImg from '../../../assets/genres/reggae.jpeg';
import rockImg from '../../../assets/genres/rock.jpg';

function ListenerDashboard() {
    return(
        <div className='l-dashbaord-container'>
            <div className='row'>
                <div className="l-left-sidebar col-md-2">
                    <NavLink to="/" className="l-logo" title='beatbridge_logo'>
                        <div className='parent-logo-container'>
                            <div className='logo-container'>
                                <img src={logoImg} alt="logo" />
                            </div>
                            <div>BeatBridge</div>
                        </div>
                    </NavLink>
                </div>

                <div className='col-md-7'>
                    <LSearchForm />
                </div>

                <div className='l-right-sidebar col-md-3'>
                    <div className='l-right-sidebar-user-info'>
                        <div className='l-dashboard-profile-container'>
                            <FaUser className='l-dash-user-icon'/>
                        </div>

                        <div className='l-dashboard-user-name'>
                            <h4>Caleb</h4>
                            <p>Premium Subscriber</p>
                        </div>
                    </div>
                    <div className='l-bell-icon-container'>
                        <FaBell className='l-dash-bell-icon'/>
                    </div>
                </div>
            </div>
            <main className='row l-main'>
                <div className='col-md-2 l-menu-bar'>
                    <h4>Menu</h4>
                    <hr />

                    <div className='l-menu-items'>
                        <div className='l-dashbaord-menu-items'>
                            <FaUser className='menu-icon' />
                            <h5>Profile</h5>
                        </div>
                        <div className='l-dashbaord-menu-items'>
                            <FontAwesomeIcon icon={faGauge} className='menu-icon' />
                            <h5>Dashboard</h5>
                        </div>
                        <div className='l-dashbaord-menu-items'>
                            <FaHeart className='menu-icon' />
                            <h5>Favourite</h5>
                        </div>
                        <div className='l-dashbaord-menu-items'>
                            <FaTag className='menu-icon' />
                            <h5>Tags</h5>
                        </div>
                        <div className='l-dashbaord-menu-items'>
                            <FontAwesomeIcon icon={faUserGroup} className='menu-icon' />
                            <h5>Friends</h5>
                        </div>
                    </div>
                </div>

                <div className='col-md-7 l-discover-genre'>
                    <div className='l-discover-genre-top'>
                        <h5>
                            <FaMusic className='l-discover-genre-music-icon' />
                        </h5>
                        <h2>
                            Discover Genre
                        </h2>
                    </div>

                    <div className='l-discover-genre-bottom'>
                        <DiscoverGenre
                            genre_img={discoImg}
                            genre_name="Disco"
                            track_num={120}
                        />
                        <DiscoverGenre
                            genre_img={popImg}
                            genre_name="Pop"
                            track_num={180}
                        />
                        <DiscoverGenre
                            genre_img={danceImg}
                            genre_name="Dance"
                            track_num={100}
                        />
                        <DiscoverGenre
                            genre_img={reggaeImg}
                            genre_name="Reggae"
                            track_num={170}
                        />
                        <DiscoverGenre
                            genre_img={rockImg}
                            genre_name="Rock"
                            track_num={200}
                        />
                    </div>
                </div>

                <div className='col-md-3 l-right-menu'>
                    <h4 className='l-top-artist-column'>Top Artist</h4>

                    <TopArtistCard
                        artist_name="Central Cee"
                        artist_music="Committment Issues"
                    />

                    <TopArtistCard
                        artist_name="Taylor Swift"
                        artist_music="Cruel Summer"
                    />

                    <TopArtistCard
                        artist_name="Drake"
                        artist_music="Certified Lover Boy"
                    />
                </div>
            </main>
        </div>
    )
}

export default ListenerDashboard;
