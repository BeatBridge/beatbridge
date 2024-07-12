import './userprofiletrending.css';
import placeholderImg from '../../assets/placeholder.png';

function UserProfileTrending (props) {
    return (
        <div>
            <div className='t-placeholder-container'>
                <img src={placeholderImg} alt="playlist-image" />
            </div>
            <div className='t-playlist-desc-container'>
                <h4>{props.name}</h4>
            </div>
        </div>
    )
}

export default UserProfileTrending
