import { useEffect } from "react";
import API from "../../api.js"
import propTypes from "prop-types";


function SpotifyOAuth(props) {
    const handleLogin = () => {
        window.location.href = `https://spotify.com/login/oauth/authorize?client_id=${import.meta.env.SPOTIFY_CLIENT_ID}&redirect_uri=${import.meta.env.SPOTIFY_REDIRECT_URI}`
    }

    // Spotify OAuth - callback function
    useEffect(() => {
        const handlSpotifyCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");
            if (code) {
                const JWT = await API.createJWT(code).then(response => response.json());
                props.JWTSetter(JWT["encoded"]);
                localStorage.setItem("jwt", JWT["encoded"]);
                window.location.href = "/";
            }
        }
        handleSpotifyCallback();
    }, []);

    return (
        <div className="btn btn-sm btn-outline-light" onClick={handleLogin}>
            Login with Spotify
            <i className="bi bi-github ms-1"></i>
        </div>
    )
}

SpotifyOAuth.propTypes = {
    JWTSetter: propTypes.func.isRequired,
}

export default GitHubOAuth;
