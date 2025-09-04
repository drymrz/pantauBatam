import { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import type { Camera } from '../types';

export type GridSize = 1 | 2 | 4 | 8 | 16;

interface MultiViewGridProps {
  cameras: Camera[];
  selectedCameras: Camera[];
  gridSize: GridSize;
}

const MultiViewGrid = ({ cameras, selectedCameras, gridSize }: MultiViewGridProps) => {
  // Placeholder untuk grid yang belum terisi
  const emptyGridItem = (index: number) => (
    <div key={`empty-${index}`} className="bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-gray-600 text-center p-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p>Pilih kamera dari sidebar</p>
      </div>
    </div>
  );

  // Generate grid layout berdasarkan ukuran grid
  const gridLayoutClass = () => {
    switch (gridSize) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 4:
        return 'grid-cols-2';
      case 8:
        return 'grid-cols-4';
      case 16:
        return 'grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  const gridRowsClass = () => {
    switch (gridSize) {
      case 1:
        return 'grid-rows-1';
      case 2:
        return 'grid-rows-1';
      case 4:
        return 'grid-rows-2';
      case 8:
        return 'grid-rows-2';
      case 16:
        return 'grid-rows-4';
      default:
        return 'grid-rows-1';
    }
  };

  // Memastikan selectedCameras sesuai dengan gridSize
  const renderCameras = () => {
    const gridItems = [];

    // Render kamera yang dipilih
    for (let i = 0; i < gridSize; i++) {
      if (i < selectedCameras.length) {
        const camera = selectedCameras[i];
        gridItems.push(
          <div key={camera.id} className="relative rounded-lg overflow-hidden">
            <VideoPlayer
              src={camera.streamUrl}
              autoPlay
              muted={gridSize > 1} // Hanya unmute jika hanya 1 video
              controls={gridSize <= 4} // Tampilkan kontrol hanya jika grid kecil
              className="rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 pointer-events-none">
              <h3 className="text-white text-sm font-medium truncate">{camera.name}</h3>
            </div>
          </div>
        );
      } else {
        gridItems.push(emptyGridItem(i));
      }
    }

    return gridItems;
  };

  return (
    <div
      className={`grid ${gridLayoutClass()} ${gridRowsClass()} gap-2 h-full w-full`}
    >
      {renderCameras()}
    </div>
  );
};

export default MultiViewGrid;
