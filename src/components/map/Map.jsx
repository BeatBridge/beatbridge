// import React, { useEffect, useState } from 'react';
// import API from '../../api.js';
// import { NavLink } from 'react-router-dom';
// import logoImg from '/beatbridge_logo.png';
// import './map.css';

// function Map () {
//     const [playlists, setPlaylists] = useState([]);
//     const [tracks, setTracks] = useState([]);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchPlaylists = async () => {
//             const result = await API.getStoredPlaylists();
//             if (result.error) {
//                 setError(result.error);
//             } else {
//                 setPlaylists(result);
//             }
//         };

//         fetchPlaylists();
//     }, []);

//     const fetchPlaylistTracks = async (playlistId) => {
//         const result = await API.getStoredPlaylistTracks(playlistId);
//         if (result.error) {
//             setError(result.error);
//         } else {
//             setTracks(result);
//         }
//     };

//     return (
//         <div className="container">
//             <div className='row'>
//                 <div className='col-md-2'>
//                     <NavLink to="/" className="auth-logo" title='beatbridge_logo'>
//                         <div className='parent-logo-container'>
//                             <div className='auth-logo-container'>
//                                 <img src={logoImg} alt="logo" />
//                             </div>
//                             <div>BeatBridge</div>
//                         </div>
//                     </NavLink>
//                 </div>
//             </div>
//             <div className='row'>
//                 <div className='col-md-12'>
//                     <h1>Featured Playlists</h1>
//                     {error && <p>{JSON.stringify(error)}</p>}
//                     {!error && (
//                         <ul>
//                             {playlists.map(playlist => (
//                                 <li key={playlist.id}>
//                                     <button onClick={() => fetchPlaylistTracks(playlist.id)}>{playlist.name}</button>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>
//             </div>
//             <div className='row'>
//                 <div className='col-md-12'>
//                     <h2>Tracks</h2>
//                     {tracks.length > 0 ? (
//                         <ul>
//                             {tracks.map((track, index) => (
//                                 <li key={index}>
//                                     {track.name} by {track.artists.map(artist => artist.name).join(', ')}
//                                     <p>Album: {track.album}</p>
//                                     <p>Duration: {track.duration} ms</p>
//                                     <ul>
//                                         {track.artists.map(artist => (
//                                             <li key={artist.id}>
//                                                 {artist.name}
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>Select a playlist to view its tracks.</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Map;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, SVGOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import API from '../../api.js';
import './map.css';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
const socket = io(backendUrlAccess);

function Map() {
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            const result = await API.getGenresByLocation();
            if (result.error) {
                setError(result.error);
            } else {
                setLocations(result);
            }
        };

        fetchLocations();

        socket.on('update', (data) => {
            setLocations(prevLocations => {
                const existingLocation = prevLocations.find(l => l.name === data.name);
                if (existingLocation) {
                    return prevLocations.map(l => l.name === data.name ? data : l);
                } else {
                    return [...prevLocations, data];
                }
            });
        });

        return () => {
            socket.off('update');
        };
    }, []);

    const getBounds = (pathData) => {
        const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgPath.setAttribute("d", pathData);

        const box = svgPath.getBBox();
        return [[box.y, box.x], [box.y + box.height, box.x + box.width]];
    };

    return (
        <MapContainer center={[51.505, -0.09]} zoom={2} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map(location => (
                <>
                    <Marker key={location.name} position={[location.latitude, location.longitude]}>
                        <Popup>
                            <strong>{location.name}</strong><br />
                            Genres: {location.genres.join(', ')}
                        </Popup>
                    </Marker>
                    {location.pathData && (
                        <SVGOverlay key={location.name + '-svg'} bounds={getBounds(location.pathData)}>
                            <svg>
                                <path d={location.pathData} fill="blue" />
                            </svg>
                        </SVGOverlay>
                    )}
                </>
            ))}
        </MapContainer>
    );
}

export default Map;
