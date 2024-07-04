import './discovergenre.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';

function DiscoverGenre (props) {
    return (
        <div className='l-discover-genre-bottom-container'>
            <div className='discover-genre-cont'>
                <img src={props.genre_img} alt="disco" />
            </div>
            <div className='discover-genre-desc'>
                <div className='discover-genre-desc-details'>
                    <h3>{props.genre_name}</h3>
                    <p>{props.track_num} Tracks</p>
                </div>
                <div className='discover-genre-desc-play'>
                    <FontAwesomeIcon icon={faCirclePlay} />
                </div>
            </div>
        </div>
    )
}

export default DiscoverGenre;
