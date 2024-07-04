import { FaEllipsisV, FaUser } from 'react-icons/fa';
import './topartistcard.css';

function TopArtistCard (props) {
    return (
        <div className='top-artist-container'>
            <div className='top-artist-sub-container'>
                <div className='top-artist-img'>
                    <FaUser className='l-top-artist-icon' />
                </div>
                <div className='top-artist-info'>
                    <h4>{props.artist_name}</h4>
                    <h6>{props.artist_music}</h6>
                </div>
            </div>
            <div className='ta-ellipsis-container'>
                <FaEllipsisV className='ta-ellipsis'/>
            </div>
        </div>
    )
}

export default TopArtistCard;
