import React, { useState } from "react";
import { FaTag } from "react-icons/fa";
import './taggingform.css';

const TaggingForm = ({ song, onTag, onClose }) => {
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
        onClose();
    };

    return (
        <div className="tagging-form">
            <h3>Tagging Form</h3>
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
                    <FaTag className='menu-icon custom-tag-icon' />
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
                </div>
            </form>
        </div>
    )
};

export default TaggingForm;
