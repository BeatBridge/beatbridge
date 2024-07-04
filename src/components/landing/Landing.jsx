import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './landing.css';
import HomeDiscover from '../homediscover/HomeDiscover';
import HomeFindOut from '../homefindout/HomeFindOut';
import Footer from '../footer/Footer';
import rockImg from '../../assets/genres/rock.jpg';
import discoImg from '../../assets/genres/disco.jpg';
import danceImg from '../../assets/genres/dance.jpeg';
import popImg from '../../assets/genres/pop.jpg';
import reggaeImg from '../../assets/genres/reggae.jpeg';
import hipHopImg from '../../assets/genres/hiphop.jpeg';

function Landing() {

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
                    <HomeDiscover />
                </section>

                <div className='svg-container'>
                    <svg width="100%" height="40" viewBox="0 0 2880 126" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 42L96 35C192 28 384 14 576 17.5C768 21 960 42 1152 56C1344 70 1536 77 1728 66.5C1920 56 2112 28 2304 14C2496 0 2688 0 2784 0H2880V126H2784C2688 126 2496 126 2304 126C2112 126 1920 126 1728 126C1536 126 1344 126 1152 126C960 126 768 126 576 126C384 126 192 126 96 126H0V42Z" fill="#151E3F"/>
                    </svg>

                    <div className='find-out-container'>
                        <div className='fo-left-cont'>
                            <h3>Explore a world of new independent artists tailored to your unique musical taste.</h3>
                            <div className='find-out-button-container'>
                                <a href="">
                                    <button className='fob-cont-1'>Learn more</button>
                                </a>
                                <a href="">
                                    <button className='fob-cont-2'>Sign Up</button>
                                </a>
                            </div>
                        </div>
                        <div className='hfo-parent'>
                            <HomeFindOut
                                genre_img={discoImg}
                                genre_name="Disco"
                            />
                            <HomeFindOut
                                genre_img={danceImg}
                                genre_name="Dance"
                            />
                            <HomeFindOut
                                genre_img={rockImg}
                                genre_name="Rock"
                            />
                            <HomeFindOut
                                genre_img={popImg}
                                genre_name="Pop"
                            />
                            <HomeFindOut
                                genre_img={reggaeImg}
                                genre_name="Reggae"
                            />
                            <HomeFindOut
                                genre_img={hipHopImg}
                                genre_name="Hip Hop"
                            />
                        </div>
                    </div>
                    <div>
                        <Footer />
                    </div>
                </div>
            </main>

        </>
    )
}

export default Landing;
