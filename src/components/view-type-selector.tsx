import React from 'react';

interface ViewTypeSelectorProps {
  viewType: 'horizontal' | 'radial';
  setViewType: (type: 'horizontal' | 'radial') => void;
}

const ViewTypeSelector: React.FC<ViewTypeSelectorProps> = ({ viewType, setViewType }) => {
  return (
    <div className='flex justify-center mb-4'>
      <button
        className={`px-4 py-2 mx-2 rounded ${
          viewType === 'horizontal' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
        }`}
        onClick={() => setViewType('horizontal')}
      >
        Horizontal View
      </button>
      <button
        className={`px-4 py-2 mx-2 rounded ${
          viewType === 'radial' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
        }`}
        onClick={() => setViewType('radial')}
        disabled
      >
        Radial View 🔒
      </button>
    </div>
  );
};

export default ViewTypeSelector;
