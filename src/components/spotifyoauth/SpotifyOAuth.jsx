import { useEffect } from "react";
import API from "../../api.js"


function SpotifyOAuth({isSpotifySignedIn}) {
    const handleLogin = () => {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_SPOTIFY_REDIRECT_URI}&response_type=code&scope=user-top-read user-read-private`
    }
    if (isSpotifySignedIn) {
        return null;
    }
    return (
        <div className="btn btn-sm btn-outline-light" onClick={handleLogin}>
            Login with Spotify
        </div>
    )
}

export default SpotifyOAuth;
