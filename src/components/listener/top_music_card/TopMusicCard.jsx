import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faPause, faWaveSquare } from '@fortawesome/free-solid-svg-icons';
import './top_music_card.css';
import { FaUser } from 'react-icons/fa';

function TopMusicCard (props) {
    return(
        <div className='top-music-container'>
            <div className='top-music-sub-container'>
                <div className='top-music-info-1'>
                    <h3>0{props.music_num}</h3>
                    <FaUser className='l-top-music-icon' />
                </div>
                <div className='top-music-info-2'>
                    <h3>{props.music_name}</h3>
                </div>
            </div>
            <div>
                <div className='tm-music-duration-container'>
                    <h4>{props.music_duration}</h4>
                </div>
            </div>
            <div>
                <div>
                    <FontAwesomeIcon icon={faWaveSquare} className='tm-wave'/>
                </div>
            </div>
            <div className='tm-play-container'>
                <FontAwesomeIcon icon={faCirclePlay} className="tm-play"/>
                <FontAwesomeIcon icon={faPause} className="tm-pause"/>
            </div>
        </div>
    )
}

export default TopMusicCard;
