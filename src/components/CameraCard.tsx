import { Link } from 'react-router-dom';
import type { Camera } from '../types';
import { useScreenSize, SCREEN_SIZE } from '../hooks/useScreenSize';
import ThumbnailGenerator from './ThumbnailGenerator';

interface CameraCardProps {
  camera: Camera;
  onClick?: (camera: Camera) => void;
  isSelected?: boolean;
}

const CameraCard = ({ camera, onClick, isSelected = false }: CameraCardProps) => {
  const screenSize = useScreenSize();
  const placeholderImage = 'https://matanya.batam.go.id/logcctv/files/cctv/4.jpg';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(camera);
    }
  };

  // Handler untuk error loading image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Hide the img element on error
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';

    // Show the thumbnail generator (already present in DOM)
    const parent = target.parentElement;
    if (parent) {
      const generator = parent.querySelector('.thumbnail-generator');
      if (generator) {
        (generator as HTMLElement).style.display = 'flex';
      }
    }
  };

  // Mobile layout
  if (screenSize === SCREEN_SIZE.MOBILE) {
    return (
      <Link
        to={`/camera/${camera.id}`}
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
      >
        <div className="relative aspect-video">
          <img
            src={camera.thumbnail || placeholderImage}
            alt={camera.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
          <div className="thumbnail-generator absolute inset-0 hidden">
            <ThumbnailGenerator cameraName={camera.name} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <h3 className="text-white font-bold truncate">{camera.name}</h3>
          </div>
        </div>
        <div className="p-4 pt-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Live
          </span>
        </div>
      </Link>
    );
  }

  // Desktop/Tablet layout - Simple gallery card
  return (
    <div
      onClick={handleClick}
      className={`
        cursor-pointer 
        bg-gray-800 
        rounded-lg 
        overflow-hidden 
        shadow-lg 
        transition-all 
        duration-200 
        hover:scale-[1.02] 
        hover:shadow-xl
        ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : ''}
      `}
    >
      <div className="relative aspect-video">
        <img
          src={camera.thumbnail || placeholderImage}
          alt={camera.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="thumbnail-generator absolute inset-0 hidden">
          <ThumbnailGenerator cameraName={camera.name} />
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate">{camera.name}</h3>
      </div>
    </div>
  );
};

export default CameraCard;
