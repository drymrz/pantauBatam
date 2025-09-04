import { Link } from 'react-router-dom';
import type { Camera } from '../types';
import { useScreenSize, SCREEN_SIZE } from '../hooks/useScreenSize';

interface CameraCardProps {
  camera: Camera;
  onClick?: (camera: Camera) => void;
  isSelected?: boolean;
}

const CameraCard = ({ camera, onClick, isSelected = false }: CameraCardProps) => {
  const screenSize = useScreenSize();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(camera);
    }
  };

  // Mobile layout
  if (screenSize === SCREEN_SIZE.MOBILE) {
    return (
      <Link
        to={`/camera?id=${camera.id}`}
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
      >
        <div className="relative aspect-video">
          <img
            src={camera.thumbnail || '/btm.jpg'}
            alt={camera.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <h3 className="text-white font-bold truncate">{camera.name}</h3>
          </div>
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
          src={camera.thumbnail || '/btm.jpg'}
          alt={camera.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate">{camera.name}</h3>
      </div>
    </div>
  );
};

export default CameraCard;
