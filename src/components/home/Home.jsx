import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './home.css';
import AboutCard from '../aboutcard/AboutCard';

function Home() {

    const videoRef = useRef(null);

    useEffect (() => {
        const handleScroll = () => {
            if (videoRef.current) {
                const rect = videoRef.current.getBoundingClient();
                if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                    videoRef.current.play();
                } else {
                    videoRef.current.pause();
                }
            }
        }

    window.addEventListener('scroll', handleScroll);

    return () => {
        window.removeEventListener('scroll', handleScroll)
    }
    }, []);

    return (
        <>
            <Navbar />

            <main>
                <section className="banner">
                    <div className="banner-video">
                        <video ref={videoRef} autoPlay loop muted>
                            <source src="../../../src/assets/video1.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <div className="banner-text">
                        <h1>Where you discover new artistes, genres everyday</h1>
                        <hr className='banner-hr' />
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam ratione obcaecati explicabo molestiae inventore sed neque ab nam doloremque, magni.</p>
                        <Link><button className='banner-button'>Learn More</button></Link>
                    </div>
                </section>

                <section>
                    <div className='about-container'>
                        <div className='about-title'>
                            <h2>Discover new music at your fingertips!</h2>
                        </div>

                        <div className="about-card">
                            <AboutCard />
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Home;
