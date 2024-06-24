import './aboutcard.css';
import placeHolder from '/src/assets/placeholder.jpeg';

function AboutCard () {
    return (
        <div className='about-card'>
            <div className='example-img'>
                <img src={placeHolder} alt="image" />
            </div>

            <div className='example-desc'>
                <h4>Organization Name</h4>
                <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rerum dolores tempora modi.</p>
            </div>
        </div>
    )
}

export default AboutCard;
