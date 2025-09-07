import { Link } from 'react-router-dom';
import type { Camera } from '../types';
import { useScreenSize, SCREEN_SIZE } from '../hooks/useScreenSize';

interface CameraCardProps {
  camera: Camera;
  onClick?: (camera: Camera) => void;
  isSelected?: boolean;
}

const CameraCard = ({ camera, onClick, isSelected }: CameraCardProps) => {
  const screenSize = useScreenSize();

  // If onClick is provided, render as button instead of Link
  if (onClick) {
    return (
      <div
        onClick={() => onClick(camera)}
        className={`bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
      >
        <div className="relative aspect-video">
          <img
            src={camera.thumbnail || '/btm.jpg'}
            alt={camera.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-0 right-0 p-2">
            <div className=" backdrop-blur-lg bg-black/5 w-full flex rounded-full p-2 px-3 border-none items-center">
              <div className="w-[0.35rem] h-[0.35rem] bg-green-400 rounded-full"></div>
              <h3 className="text-white truncate ms-3 font-medium text-sm">Live</h3>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">{camera.name}</h3>
          <p className="text-gray-400 text-sm">Live Stream</p>
        </div>
      </div>
    );
  }

  // Default behavior with Link
  return (
    <Link
      to={screenSize === SCREEN_SIZE.MOBILE ? `/camera?id=${camera.id}` : `/dashboard?camera=${camera.id}`}
      className="bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      <div className="relative aspect-video">
        <img
          src={camera.thumbnail || '/btm.jpg'}
          alt={camera.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-0 right-0 p-2">
          <div className=" backdrop-blur-lg bg-black/5 w-full flex rounded-full p-2 px-3 border-none items-center">
            <div className="w-[0.35rem] h-[0.35rem] bg-green-400 rounded-full"></div>
            <h3 className="text-white truncate ms-3 font-medium text-sm">Live</h3>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex w-full gap-1 p-2">
          <div className=" backdrop-blur-[5px] bg-black/5 w-full flex rounded-full p-3 border-none">
            <h3 className="text-white truncate ms-2 font-medium">{camera.name}</h3>
          </div>
          <div className=" backdrop-blur-[5px] bg-black/5 flex rounded-full border-none p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-fullscreen m-1" viewBox="0 0 16 16">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CameraCard;
