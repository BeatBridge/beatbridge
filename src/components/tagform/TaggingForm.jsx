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
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                        <option value="afrobeats">Afrobeats</option>
                        <option value="hiphop">Hip-Hop</option>
                        <option value="electronic">Electronic</option>
                        <option value="reggae">Reggae</option>
                        <option value="blues">Blues</option>
                        <option value="country">Country</option>
                        <option value="folk">Folk</option>
                        <option value="metal">Metal</option>
                        <option value="rnb">R&B</option>
                        <option value="soul">Soul</option>
                        <option value="funk">Funk</option>
                        <option value="disco">Disco</option>
                        <option value="techno">Techno</option>
                        <option value="house">House</option>
                        <option value="dubstep">Dubstep</option>
                        <option value="trance">Trance</option>
                        <option value="dance">Dance</option>
                        <option value="indie">Indie</option>
                        <option value="alternative">Alternative</option>
                        <option value="punk">Punk</option>
                        <option value="grunge">Grunge</option>
                        <option value="opera">Opera</option>
                        <option value="gospel">Gospel</option>
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
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="energetic">Energetic</option>
                        <option value="relaxed">Relaxed</option>
                        <option value="angry">Angry</option>
                        <option value="romantic">Romantic</option>
                        <option value="melancholic">Melancholic</option>
                        <option value="upbeat">Upbeat</option>
                        <option value="peaceful">Peaceful</option>
                        <option value="moody">Moody</option>
                        <option value="excited">Excited</option>
                        <option value="nostalgic">Nostalgic</option>
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
                        <option value="slow">Slow</option>
                        <option value="medium">Medium</option>
                        <option value="fast">Fast</option>
                        <option value="veryslow">Very Slow</option>
                        <option value="veryfast">Very Fast</option>
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
