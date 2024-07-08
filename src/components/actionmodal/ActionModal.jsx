import React, { useState } from "react";
import './actionmodal.css';

const ActionModal = ({ song, onClose, onTag, onViewDetails, onAddToLibrary }) => {
    const [genre, setGenre] = useState('');
    const [mood, setMood] = useState('');
    const [tempo, setTempo] = useState('');
    const [customTags, setCustomTags] = useState('');

    const handleTag = () => {
        const tags = {
            genre,
            mood,
            tempo,
            customTags: customTags.split(',').map(tag => tag.trim()),
        };
        onTag(song, tags);
    };

    return (
        <div className="action-modal">
            <div className="modal-content">
                <h2>{song.name}</h2>
                <p>{song.artists[0].name} - {song.album.name}</p>
                <div className="modal-actions">
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Genre</label>
                            <select
                                className="form-select"
                                value={genre}
                                onChange={e => setGenre(e.target.value)}
                            >
                                <option value="">Select Genre</option>
                                <option value="Pop">Pop</option>
                                <option value="Rock">Rock</option>
                                <option value="Jazz">Jazz</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mood</label>
                            <select
                                className="form-select"
                                value={mood}
                                onChange={e => setMood(e.target.value)}
                            >
                                <option value="">Select Mood</option>
                                <option value="Happy">Happy</option>
                                <option value="Sad">Sad</option>
                                <option value="Energetic">Energetic</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Tempo</label>
                            <select
                                className="form-select"
                                value={tempo}
                                onChange={e => setTempo(e.target.value)}
                            >
                                <option value="">Select Tempo</option>
                                <option value="Slow">Slow</option>
                                <option value="Medium">Medium</option>
                                <option value="Fast">Fast</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Custom Tags</label>
                            <input
                                type="text"
                                className="form-control"
                                value={customTags}
                                onChange={e => setCustomTags(e.target.value)}
                                placeholder="Enter custom tags separated by commas"
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-primary" onClick={handleTag}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            <button className="close-button" onClick={onClose}>Close</button>
        </div>
    );
};

export default ActionModal;
