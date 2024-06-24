import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin} from 'react-icons/fa';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import './footer.css';

function Footer () {
    return(
        <div className='container my-5'>
            <footer className='text-center'>
                <div>
                    <section className='mt-5'>
                        <div className='row text-center d-flex justify-content-center pt-5'>
                            <div className='col-md-2'>
                                <h4 className='text-uppercase font-weight-bold'>
                                    <a href="">About us</a>
                                </h4>
                            </div>

                            <div className='col-md-2'>
                                <h4 className='text-uppercase font-weight-bold'>
                                    <a href="">Products</a>
                                </h4>
                            </div>

                            <div className='col-md-2'>
                                <h4 className='text-uppercase font-weight-bold'>
                                    <a href="">Pricing</a>
                                </h4>
                            </div>

                            <div className='col-md-2'>
                                <h4 className='text-uppercase font-weight-bold'>
                                    <a href="">Help</a>
                                </h4>
                            </div>

                            <div className='col-md-2'>
                                <h4 className='text-uppercase font-weight-bold'>
                                    <a href="">Contact</a>
                                </h4>
                            </div>
                        </div>
                    </section>

                    <hr />

                    <section className='mb-5'>
                        <div className='row d-flex justify-content-center'>
                            <div className='col-lg-8'>
                                <article>
                                    <h4 className='footer-text'>
                                        Embrace the future of music exploration and find new artists effortlessly. <br /><a href="">Join us</a> today!
                                    </h4>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section className='text-center mb-5 logo-section'>
                        <h3 className='footer-logos'>
                            <a href="" className='me-4'>
                                <FaInstagram className='footer-logo-icons ig-icon' />
                            </a>
                        </h3>

                        <h3 className='footer-logos'>
                            <a href="" className='me-4'>
                                <FaFacebook className='footer-logo-icons fb-icon' />
                            </a>
                        </h3>

                        <h3 className='footer-logos'>
                            <a href="" className='me-4'>
                                <FontAwesomeIcon icon={faXTwitter} className='footer-logo-icons x-icon'/>
                            </a>
                        </h3>

                        <h3 className='footer-logos'>
                            <a href="" className='me-4'>
                                <FaLinkedin className='footer-logo-icons linkedin-icon' />
                            </a>
                        </h3>

                        <h3 className='footer-logos'>
                            <a href="" className='me-4'>
                                <FaGithub className='footer-logo-icons git-icon' />
                            </a>
                        </h3>
                    </section>
                </div>

                <div className='p-3'>
                    <h5>Copyright&copy;2024 Beatbridge</h5>
                </div>
            </footer>
        </div>
    )
}

export default Footer;
