import React from 'react';
import Navbar from '../navbar/Navbar';
import './home.css';

function Home() {
    return (
        <>
            <Navbar />

            <main>
                <section className="banner">
                    <div className="banner-video">
                        <video autoPlay loop muted>
                            <source src="your-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <div className="banner-text">
                        <h1>Your text here</h1>
                        <p>Your subtext here</p>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Home;
