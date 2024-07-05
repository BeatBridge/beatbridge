import React from 'react';
import './songactions.css';

const SongActions = ({ song, jwt, onClose, onTag, onViewDetails, onAddToLibrary }) => {
    return (
        <ul>
            <li>Title: {song.name}</li>
            <li>Artist: {song.artist}</li>
            <li>
                <button onClick={() => onTag(song.id, jwt)}>Tag</button>
                <button onClick={() => onViewDetails(song.id)}>View Details</button>
                <button onClick={() => onAddToLibrary(song.id, jwt)}>Add to Library</button>
                <button onClick={onClose}>Close</button>
            </li>
        </ul>
    );
};

export default SongActions;
