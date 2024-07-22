import './userprofileplaylist.css';
import placeholderImg from '../../assets/placeholder.png';

function UserProfilePlaylist(props) {
    return (
        <div>
            <div className='v-placeholder-container'>
                <img src={props.image || placeholderImg} alt="playlist-image" />
            </div>
            <div className='v-playlist-desc-container'>
                <h4>{props.desc}</h4>
                <p>{props.followerCount} Followers</p>
            </div>
        </div>
    );
}

export default UserProfilePlaylist;
