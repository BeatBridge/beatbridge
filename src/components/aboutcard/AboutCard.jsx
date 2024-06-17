import './aboutcard.css';
import placeHolder from '/src/assets/placeholder.jpeg';

function AboutCard () {
    return (
        <>
            <div className='example-img'>
                <img src={placeHolder} alt="image" />
            </div>

            <div className='example-desc'>
                <h3>Organization Name</h3>
                <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rerum dolores tempora modi cupiditate maxime voluptates quo assumenda eius iste blanditiis voluptas facilis optio similique consequatur ex, velit laborum obcaecati dicta.</p>
            </div>
        </>
    )
}

export default AboutCard;
