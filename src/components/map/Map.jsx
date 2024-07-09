import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
                const existingLocation = prevLocations.find(l => l.id === data.id);
                if (existingLocation) {
                    return prevLocations.map(l => l.id === data.id ? data : l);
                } else {
                    return [...prevLocations, data];
                }
            });
        });

        return () => {
            socket.off('update');
        };
    }, []);

    return (
        <MapContainer center={[37.8, -96.9]} zoom={5} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map(location => (
                <Marker key={location.id} position={[location.latitude, location.longitude]}>
                    <Popup>
                        <strong>{location.name}</strong><br />
                        Genres: {location.genres.join(', ')}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default Map;
