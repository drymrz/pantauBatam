import { useState } from 'react';
import type { Camera } from '../types';
import CameraCard from './CameraCard';
import type { GridSize } from './MultiViewGrid';

interface SidebarProps {
  cameras: Camera[];
  selectedCameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  gridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Sidebar = ({
  cameras,
  selectedCameras,
  onCameraSelect,
  gridSize,
  onGridSizeChange,
  isSidebarOpen,
  onToggleSidebar
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter kamera berdasarkan pencarian
  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (camera: Camera) => {
    return selectedCameras.some(c => c.id === camera.id);
  };

  const handleCameraClick = (camera: Camera) => {
    onCameraSelect(camera);
  };

  return (
    <div
      className={`
        flex flex-col h-full bg-gray-800 border-r border-gray-700 transition-all duration-300
        ${isSidebarOpen ? 'w-80' : 'w-16'}
      `}
    >
      {/* Toggle sidebar button */}
      <button
        onClick={onToggleSidebar}
        className="p-3 bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
      >
        {isSidebarOpen ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Tutup Sidebar</span>
          </>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {isSidebarOpen && (
        <>
          {/* Search input */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-600 rounded-lg bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cari kamera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex flex-col h-full">
            {/* Camera list - 65% */}
            <div className="flex-grow overflow-y-auto p-3">
              <h3 className="text-white font-medium mb-3">Daftar Kamera</h3>
              <div className="space-y-3">
                {filteredCameras.map(camera => (
                  <CameraCard
                    key={camera.id}
                    camera={camera}
                    onClick={handleCameraClick}
                    isSelected={isSelected(camera)}
                  />
                ))}
              </div>
            </div>

            {/* Grid controls - 35% */}
            <div className="p-3 border-t border-gray-700">
              <h3 className="text-white font-medium mb-3">Layout View</h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onGridSizeChange(1)}
                  className={`p-2 rounded-lg border ${gridSize === 1 ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                >
                  <div className="bg-gray-800 aspect-square rounded-sm"></div>
                </button>

                <button
                  onClick={() => onGridSizeChange(2)}
                  className={`p-2 rounded-lg border ${gridSize === 2 ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                >
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-gray-800 aspect-square rounded-sm"></div>
                    <div className="bg-gray-800 aspect-square rounded-sm"></div>
                  </div>
                </button>

                <button
                  onClick={() => onGridSizeChange(4)}
                  className={`p-2 rounded-lg border ${gridSize === 4 ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                >
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-gray-800 aspect-square rounded-sm"></div>
                    <div className="bg-gray-800 aspect-square rounded-sm"></div>
                    <div className="bg-gray-800 aspect-square rounded-sm"></div>
                    <div className="bg-gray-800 aspect-square rounded-sm"></div>
                  </div>
                </button>

                <button
                  onClick={() => onGridSizeChange(8)}
                  className={`p-2 rounded-lg border ${gridSize === 8 ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                >
                  <div className="grid grid-cols-4 gap-[2px]">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="bg-gray-800 aspect-square rounded-sm"></div>
                    ))}
                  </div>
                </button>

                <button
                  onClick={() => onGridSizeChange(16)}
                  className={`p-2 rounded-lg border ${gridSize === 16 ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600'}`}
                >
                  <div className="grid grid-cols-4 gap-[2px]">
                    {Array(16).fill(0).map((_, i) => (
                      <div key={i} className="bg-gray-800 aspect-square rounded-sm"></div>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
