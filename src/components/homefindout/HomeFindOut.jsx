import './homefindout.css';

function HomeFindOut (props) {
    return (
        <div className='home-find-out-container'>
            <div className='genre-img-cont'>
                <img src={props.genre_img} alt="genre_img" />
            </div>
            <div className='genre-text-cont'>
                <h5>{props.genre_name}</h5>
                <p>Lorem amet ipsum.</p>
            </div>
        </div>
    )
}

export default HomeFindOut;
