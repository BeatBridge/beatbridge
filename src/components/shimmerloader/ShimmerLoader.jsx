import React from 'react';
import './shimmerloader.css';

function ShimmerLoader({ type, count }) {
  const skeletonItems = (count) => {
    return Array.from({ length: count }, (_, index) => (
      <div key={index} className={`new-shimmer-item ${type}`}>
        <div className="new-shimmer-image"></div>
        <div className="new-shimmer-text new-shimmer-text-title"></div>
        <div className="new-shimmer-text new-shimmer-text-artist"></div>
      </div>
    ));
  };

  return <div className="new-shimmer-loader">{skeletonItems(count)}</div>;
}

export default ShimmerLoader;
