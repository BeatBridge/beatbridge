import { useEffect } from "react";
import API from "../../api.js"
import propTypes from "prop-types";


function SpotifyOAuth(props) {
    const handleLogin = () => {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&response_type=code&scope=user-top-read user-read-private`
    }

    // Spotify OAuth - callback function
    useEffect(() => {
        const handleSpotifyCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");
            if (code) {
                const JWT = await API.createJWT(code).then(response => response.json());
                props.JWTSetter(JWT.token);
                localStorage.setItem("jwt", JWT.token);
                window.location.href = "/l/dashboard";
            }
        }
        handleSpotifyCallback();
    }, [props.JWTSetter]);

    return (
        <div className="btn btn-sm btn-outline-light" onClick={handleLogin}>
            Login with Spotify
        </div>
    )
}

SpotifyOAuth.propTypes = {
    JWTSetter: propTypes.func.isRequired,
}

export default SpotifyOAuth;
