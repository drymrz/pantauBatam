import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { getAllCameras } from '../services/cameraService';
import type { Camera } from '../types';

type ViewLayout = 1 | 2 | 4;

interface SelectedCamera {
    camera: Camera;
    position: number;
    aspectMode: 'cover' | 'contain';
}

const CameraDetailPage = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [allCameras, setAllCameras] = useState<Camera[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewLayout, setViewLayout] = useState<ViewLayout>(() => {
        const saved = localStorage.getItem('mobileCamera_layout');
        return saved ? (parseInt(saved) as ViewLayout) : 1;
    });
    const [selectedCameras, setSelectedCameras] = useState<SelectedCamera[]>([]);

    // Save layout to localStorage
    useEffect(() => {
        localStorage.setItem('mobileCamera_layout', viewLayout.toString());
    }, [viewLayout]);

    useEffect(() => {
        fetchCameras();
    }, []);

    // Set initial camera from URL query parameter
    useEffect(() => {
        if (id && allCameras.length > 0) {
            const camera = allCameras.find(c => c.id === id);
            if (camera) {
                setSelectedCameras([{ camera, position: 0, aspectMode: 'contain' }]);
            }
        }
    }, [id, allCameras]);

    const fetchCameras = async () => {
        try {
            const response = await getAllCameras();
            if (response.success && response.data) {
                setAllCameras(response.data);
            }
        } catch (err) {
            console.error('Error fetching cameras:', err);
        }
    };

    const handleCameraSelect = (camera: Camera) => {
        // Check if camera is already selected - if yes, remove it (toggle)
        const existingCameraIndex = selectedCameras.findIndex(item => item.camera.id === camera.id);
        if (existingCameraIndex !== -1) {
            // Remove camera and reposition others
            setSelectedCameras(prev =>
                prev.filter(item => item.camera.id !== camera.id)
                    .map((item, index) => ({
                        ...item,
                        position: index
                    }))
            );
            return;
        }

        if (viewLayout === 1) {
            // Single view mode - replace the only slot
            setSelectedCameras([{ camera, position: 0, aspectMode: 'contain' }]);
        } else {
            // Multi view mode - add to next available slot
            const nextPosition = selectedCameras.length;
            if (nextPosition < viewLayout) {
                setSelectedCameras(prev => [...prev, { camera, position: nextPosition, aspectMode: 'contain' }]);
            }
            // If all slots are full, do nothing (don't replace)
        }
    };

    // Helper function to check if a camera can be selected
    const canSelectCamera = (camera: Camera) => {
        const isAlreadySelected = selectedCameras.some(item => item.camera.id === camera.id);
        if (isAlreadySelected) return true; // Can always deselect

        if (viewLayout === 1) return true; // Single view can always replace

        return selectedCameras.length < viewLayout; // Multi view only if there's space
    };

    const handleLayoutChange = (layout: ViewLayout) => {
        setViewLayout(layout);
        // Adjust selected cameras to fit new layout
        if (layout < selectedCameras.length) {
            setSelectedCameras(prev => prev.slice(0, layout));
        }
    };

    const removeCameraFromSlot = (position: number) => {
        setSelectedCameras(prev =>
            prev.filter(item => item.position !== position)
                .map(item => ({
                    ...item,
                    position: item.position > position ? item.position - 1 : item.position
                }))
        );
    };

    const toggleAspectRatio = (position: number) => {
        setSelectedCameras(prev =>
            prev.map(item =>
                item.position === position
                    ? { ...item, aspectMode: item.aspectMode === 'cover' ? 'contain' : 'cover' }
                    : item
            )
        );
    };

    const getGridClass = () => {
        switch (viewLayout) {
            case 1: return 'grid-cols-1 grid-rows-1';
            case 2: return 'grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1'; // Mobile: vertical, Desktop: horizontal
            case 4: return 'grid-cols-2 grid-rows-2';
            default: return 'grid-cols-1 grid-rows-1';
        }
    };

    const renderCameraSlot = (position: number) => {
        const selectedCamera = selectedCameras.find(item => item.position === position);

        if (selectedCamera) {
            return (
                <div key={position} className="relative bg-gray-900 rounded-lg overflow-hidden group h-full min-h-0">
                    <VideoPlayer
                        src={selectedCamera.camera.streamUrl}
                        autoPlay
                        muted
                        controls={false}
                        className={`w-full h-full ${selectedCamera.aspectMode === 'cover' ? 'object-cover' : 'object-contain'}`}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs">
                        {selectedCamera.camera.name}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => toggleAspectRatio(position)}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            title={`Switch to ${selectedCamera.aspectMode === 'cover' ? 'contain' : 'cover'}`}
                        >
                            {selectedCamera.aspectMode === 'cover' ? '⤡' : '⤢'}
                        </button>
                        <button
                            onClick={() => removeCameraFromSlot(position)}
                            className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        >
                            ×
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={position}
                className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 h-full min-h-0"
            >
                <div className="text-center">
                    <div className="text-2xl mb-2">📹</div>
                    <p className="text-sm">Tap camera to add</p>
                </div>
            </div>
        );
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen flex flex-col'}`}>
            <div className={`container mx-auto ${isFullscreen ? 'h-full' : 'px-4 py-8 flex-1 flex flex-col'}`}>
                {!isFullscreen && (
                    <header className="mb-6">
                        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Kembali ke Beranda
                        </Link>
                        <h1 className="text-3xl font-bold">Camera Control Center</h1>
                    </header>
                )}

                {/* Layout Options - 10% space */}
                {!isFullscreen && (
                    <div className="mb-4 md:hidden">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-300">Layout</h3>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 4].map((layout) => (
                                    <button
                                        key={layout}
                                        onClick={() => handleLayoutChange(layout as ViewLayout)}
                                        className={`w-10 h-10 rounded-lg border-2 transition-colors font-bold text-sm ${viewLayout === layout
                                            ? 'border-blue-500 bg-blue-600 text-white'
                                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            }`}
                                    >
                                        {layout}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Grid - 70% space */}
                <div className={`${isFullscreen ? 'h-full' : 'flex flex-1 mb-4'} relative`}>
                    <div className={`grid ${getGridClass()} gap-2 h-full w-full`}>
                        {Array.from({ length: viewLayout }, (_, index) => renderCameraSlot(index))}
                    </div>

                    {!isFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-full transition-colors"
                            aria-label="Enter Fullscreen"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        </button>
                    )}

                    {isFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-full transition-colors"
                            aria-label="Exit Fullscreen"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Camera Carousel - 20% space */}
                {!isFullscreen && (
                    <div className="mt-4 md:hidden">
                        <div className="mb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300">
                                        Pilih Kamera
                                    </h3>
                                    <p className="text-sm text-gray-500">{allCameras.length} kamera tersedia</p>
                                </div>
                            </div>
                        </div>

                        {allCameras.length > 0 ? (
                            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
                                {allCameras.map((cam) => {
                                    const isActive = selectedCameras.some(item => item.camera.id === cam.id);
                                    const canSelect = canSelectCamera(cam);

                                    return (
                                        <div
                                            key={cam.id}
                                            onClick={() => canSelect && handleCameraSelect(cam)}
                                            className={`flex-shrink-0 w-36 h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 snap-start ${!canSelect
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isActive
                                                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 scale-105'
                                                    : 'hover:ring-2 hover:ring-gray-500 hover:ring-offset-2 hover:ring-offset-gray-900 hover:scale-105'
                                                }`}
                                        >
                                            <div className="relative w-full h-full bg-gray-800">
                                                {/* Thumbnail placeholder */}
                                                {cam.thumbnail ? (
                                                    <img
                                                        src={cam.thumbnail}
                                                        alt={cam.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Camera name overlay */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                                    <p className="text-white text-xs font-medium truncate">{cam.name}</p>
                                                </div>

                                                {/* Status indicators */}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    {isActive && (
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
                                                    )}
                                                    {!canSelect && !isActive && (
                                                        <div className="bg-red-600 text-white text-xs px-1 rounded">FULL</div>
                                                    )}
                                                </div>

                                                {/* Overlay for better interaction feedback */}
                                                <div className={`absolute inset-0 transition-all duration-200 ${!canSelect
                                                    ? 'bg-gray-900/50'
                                                    : isActive
                                                        ? 'bg-blue-500/10'
                                                        : 'bg-transparent hover:bg-white/10'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-gray-800 p-4 rounded-lg text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-400 text-sm">Tidak ada kamera tersedia</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraDetailPage;