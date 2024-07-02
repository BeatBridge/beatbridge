import { useEffect } from "react";
import API from "../../api.js"


function SpotifyOAuth(props) {
    const handleLogin = () => {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_SPOTIFY_REDIRECT_URI}&response_type=code&scope=user-top-read user-read-private`
    }

    // Spotify OAuth - callback function
    // useEffect(() => {
    //     const handleSpotifyCallback = async () => {
    //         const urlParams = new URLSearchParams(window.location.search);
    //         const code = urlParams.get("code");
    //         if (code) {
    //             await API.sendCode(code).then(response => response.json());
    //             window.location.href = "/l/dashboard";
    //         }
    //     }
    //     handleSpotifyCallback();
    // }, []);

    return (
        <div className="btn btn-sm btn-outline-light" onClick={handleLogin}>
            Login with Spotify
        </div>
    )
}

export default SpotifyOAuth;
