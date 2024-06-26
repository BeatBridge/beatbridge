import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import "./l_dashboard.css";
import logoImg from '/beatbridge_logo.png';
import LSearchForm from '../searchform/LSearchForm';
import { FaBell, FaHeart, FaMusic, FaTag, FaUser, FaUserGraduate } from 'react-icons/fa';
import TopArtistCard from '../top_artist_card/TopArtistCard';
import { faCircleQuestion, faGauge, faGear, faHeadphonesSimple, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import DiscoverGenre from '../discover_genre/DiscoverGenre';
import discoImg from '../../../assets/genres/disco.jpg';
import popImg from '../../../assets/genres/pop.jpg';
import danceImg from '../../../assets/genres/dance.jpeg';
import reggaeImg from '../../../assets/genres/reggae.jpeg';
import rockImg from '../../../assets/genres/rock.jpg';
import TopMusicCard from '../top_music_card/TopMusicCard';

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

            <main>
                <div className='row l-main-top'>
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
                            artist_name="Burna Boy"
                            artist_music="Twice As Tall"
                        />

                        <TopArtistCard
                            artist_name="Drake"
                            artist_music="Certified Lover Boy"
                        />
                    </div>
                </div>
                <div className='row l-main-bottom'>
                    <div className='col-md-2 l-menu-bar-bottom'>
                        <h4>Help</h4>
                        <hr />

                        <div className='l-menu-items'>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faGear} className='menu-icon' />
                                <h5>Profile</h5>
                            </div>
                            <div className='l-dashbaord-menu-items'>
                                <FontAwesomeIcon icon={faCircleQuestion} className='menu-icon' />
                                <h5>FAQs</h5>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-7 l-top-music'>
                        <div className='l-top-music-top'>
                            <h5>
                                <FontAwesomeIcon icon={faHeadphonesSimple} className='l-top-music-icon-header' />
                            </h5>
                            <h2>
                                Top Music
                            </h2>
                        </div>

                        <div className='l-top-music-bottom'>
                            <TopMusicCard
                                music_num={1}
                                music_name="God's Plan"
                                music_duration="3:20"
                                music_artist="Drake"
                            />
                            <TopMusicCard
                                music_num={2}
                                music_name="The Bigger Picture"
                                music_duration="4:12"
                                music_artist="Lil Baby"
                            />
                            <TopMusicCard
                                music_num={3}
                                music_name="Verdansk"
                                music_duration="3:02"
                                music_artist="Dave"
                            />
                            <TopMusicCard
                                music_num={4}
                                music_name="3AM In NY"
                                music_duration="2:37"
                                music_artist="Fridayy"
                            />
                            <TopMusicCard
                                music_num={5}
                                music_name="Nobody Gets Me"
                                music_duration="3:01"
                                music_artist="SZA"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ListenerDashboard;
