import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faPause } from '@fortawesome/free-solid-svg-icons';
import './top_music_card.css';
import { FaUser } from 'react-icons/fa';

function TopMusicCard(props) {
    return (
        <div className='top-music-container d-flex align-items-center justify-content-between'>
            <div className='top-music-sub-container d-flex flex-grow-1'>
                <div className='top-music-info-1 d-flex align-items-center'>
                    <h3>0{props.music_num}</h3>
                    <div className='l-top-music-icon-cont'>
                        <FaUser className='l-top-music-icon' />
                    </div>
                </div>
                <div className='top-music-info-2'>
                    <h3>{props.music_name}</h3>
                    <h5>{props.music_artist}</h5>
                </div>
            </div>

            <div className='tm-duration-play-container d-flex align-items-center'>
                <h4>{props.music_duration}</h4>
            </div>

            <div className='tm-wave'>
                <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" className="bi bi-soundwave" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5m12 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5"/>
                </svg>
            </div>

            <div className='tm-play-container d-flex align-items-center'>
                <FontAwesomeIcon icon={faCirclePlay} className="tm-play"/>
                <FontAwesomeIcon icon={faPause} className="tm-pause"/>
            </div>
        </div>
    )
}

export default TopMusicCard;
