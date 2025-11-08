
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
      <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
    </div>
  );
};
