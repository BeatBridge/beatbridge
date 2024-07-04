import { FaSearch } from 'react-icons/fa';
import './lsearchform.css';

function LSearchForm () {
    return (
        <div className="l-search-container">
            <FaSearch className='search-icon'/>
            <input
            type="text"
            placeholder='Search Artists, Genres, Songs, Lyrics, and More...'
            className="search-textbox" />
        </div>
    )
}

export default LSearchForm;
