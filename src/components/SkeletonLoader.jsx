import React from 'react';

const SkeletonLoader = ({ count = 1, className = '', width = '100%', height = '1rem' }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div 
      key={index}
      className={`bg-gray-200 rounded-md animate-pulse ${className}`}
      style={{ width, height, marginBottom: '0.5rem' }}
    />
  ));

  return <>{skeletonItems}</>;
};

export default SkeletonLoader;
