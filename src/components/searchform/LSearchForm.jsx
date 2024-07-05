import { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import API from '../../api.js';
import './lsearchform.css';

function LSearchForm({ onSearchResults, onSuggestionClick }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debounceTimeoutRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        const debounceSearch = () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

            if (searchQuery.length > 2) {
                debounceTimeoutRef.current = setTimeout(async () => {
                    try {
                        const jwt = localStorage.getItem('jwt');
                        const results = await API.searchSongs(searchQuery, jwt);
                        setSuggestions(results.tracks.items.slice(0, 5));
                        onSearchResults(results.tracks.items);
                    } catch (error) {
                        console.error('Error searching songs:', error);
                    }
                }, 300);
            } else {
                setSuggestions([]);
            }
        };

        debounceSearch();

        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, [searchQuery, onSearchResults]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            try {
                const jwt = localStorage.getItem('jwt');
                const results = await API.searchSongs(searchQuery, jwt);
                onSearchResults(results.tracks.items);
                setSuggestions([]);
            } catch (error) {
                console.error('Error searching songs:', error);
            }
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery('');
        setSuggestions([]);
        onSuggestionClick(suggestion);
    };

    return (
        <div className="l-search-container">
            <FaSearch className='search-icon' />
            <input
                type="text"
                placeholder='Search Artists, Genres, Songs, Lyrics, and More...'
                className="search-textbox"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {suggestions.length > 0 && (
                <ul className={`suggestions-list ${suggestions.length === 0 ? 'hidden' : ''}`} ref={suggestionsRef}>
                    {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            <div className='l-viral-50-global-img-cont'>
                                <img src={suggestion.album.images[0]?.url} alt="Track Art" className='l-viral-50-global-img' />
                            </div>
                            <span>{suggestion.name}</span> - <span>{suggestion.artists[0].name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default LSearchForm;
