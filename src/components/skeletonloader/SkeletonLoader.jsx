import React from 'react';
import './skeletonloader.css';

function SkeletonLoader({ type }) {
  const skeletonItems = (count) => {
    return Array.from({ length: count }, (_, index) => (
      <div key={index} className={`skeleton-item ${type}`}>
        <div className="skeleton-image"></div>
        {type === 'playlist' && (
          <div className="v-playlist-desc-container">
            <div className="skeleton-text skeleton-text-short"></div>
            <div className="skeleton-text skeleton-text-long"></div>
          </div>
        )}
        {type === 'artist' && (
          <div className="t-playlist-desc-container">
            <div className="skeleton-text skeleton-text-medium"></div>
          </div>
        )}
      </div>
    ));
  };

  return <div className="skeleton-loader">{skeletonItems(type === 'playlist' ? 7 : 6)}</div>;
}

export default SkeletonLoader;
