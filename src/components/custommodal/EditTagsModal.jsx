import React, { useState, useEffect } from 'react';
import './custommodal.css';

const EditTagsModal = ({ isOpen, onRequestClose, song, onSave }) => {
    const [tags, setTags] = useState({ genre: '', mood: '', tempo: '', customTags: [] });

    useEffect(() => {
        if (song) {
            setTags({
                genre: song.genre,
                mood: song.mood,
                tempo: song.tempo,
                customTags: song.customTags ? JSON.parse(song.customTags) : []
            });
        }
    }, [song]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTags(prevTags => ({ ...prevTags, [name]: value }));
    };

    const handleSave = () => {
        onSave(tags);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onRequestClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Edit Tags</h2>
                <div className="form-group">
                    <label>Genre:</label>
                    <select
                        className="form-select"
                        name="genre"
                        value={tags.genre}
                        onChange={handleChange}
                    >
                        <option value="">Select Genre</option>
                        <option value="afrobeats">Afrobeats</option>
                        <option value="alternative">Alternative</option>
                        <option value="blues">Blues</option>
                        <option value="classical">Classical</option>
                        <option value="country">Country</option>
                        <option value="dance">Dance</option>
                        <option value="disco">Disco</option>
                        <option value="dubstep">Dubstep</option>
                        <option value="electronic">Electronic</option>
                        <option value="folk">Folk</option>
                        <option value="funk">Funk</option>
                        <option value="gospel">Gospel</option>
                        <option value="grunge">Grunge</option>
                        <option value="hiphop">Hip-Hop</option>
                        <option value="house">House</option>
                        <option value="indie">Indie</option>
                        <option value="jazz">Jazz</option>
                        <option value="metal">Metal</option>
                        <option value="opera">Opera</option>
                        <option value="pop">Pop</option>
                        <option value="punk">Punk</option>
                        <option value="rap">Rap</option>
                        <option value="reggae">Reggae</option>
                        <option value="rnb">R&B</option>
                        <option value="rock">Rock</option>
                        <option value="soul">Soul</option>
                        <option value="techno">Techno</option>
                        <option value="trance">Trance</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Mood:</label>
                    <select
                        className="form-select"
                        name="mood"
                        value={tags.mood}
                        onChange={handleChange}
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
                <div className="form-group">
                    <label>Tempo:</label>
                    <select
                        className="form-select"
                        name="tempo"
                        value={tags.tempo}
                        onChange={handleChange}
                    >
                        <option value="">Select Tempo</option>
                        <option value="veryslow">Very Slow</option>
                        <option value="slow">Slow</option>
                        <option value="medium">Medium</option>
                        <option value="fast">Fast</option>
                        <option value="veryfast">Very Fast</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Custom Tags:</label>
                    <input
                        type="text"
                        name="customTags"
                        value={tags.customTags.join(', ')}
                        onChange={(e) =>
                            setTags(prevTags => ({
                                ...prevTags,
                                customTags: e.target.value.split(',').map(tag => tag.trim())
                            }))
                        }
                    />
                </div>
                <div className="modal-buttons">
                    <button onClick={handleSave} className="save-button">Save</button>
                    <button onClick={onRequestClose} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditTagsModal;
