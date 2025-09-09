import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { getActiveCameras } from '../services/cameraService';
import type { Camera } from '../types';

type ViewLayout = 1 | 2 | 4;

interface SelectedCamera {
    camera: Camera;
    position: number;
    aspectMode: 'cover' | 'contain';
}

const CameraDetailPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [allCameras, setAllCameras] = useState<Camera[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenCameraId, setFullscreenCameraId] = useState<string | null>(null);
    const [showRotateGuide, setShowRotateGuide] = useState(false);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const hasAutoScrolled = useRef(false);
    const [viewLayout, setViewLayout] = useState<ViewLayout>(() => {
        const saved = localStorage.getItem('mobileCamera_layout');
        return saved ? (parseInt(saved) as ViewLayout) : 1;
    });
    const [selectedCameras, setSelectedCameras] = useState<SelectedCamera[]>(() => {
        // Prioritaskan localStorage untuk state recovery
        const saved = localStorage.getItem('mobileCamera_selectedCameras');
        return saved ? JSON.parse(saved) : [];
    });

    // Save layout and selected cameras to localStorage
    useEffect(() => {
        localStorage.setItem('mobileCamera_layout', viewLayout.toString());
    }, [viewLayout]);

    useEffect(() => {
        localStorage.setItem('mobileCamera_selectedCameras', JSON.stringify(selectedCameras));
    }, [selectedCameras]);

    useEffect(() => {
        fetchCameras();
    }, []);

    // Hide rotate guide when user rotates to landscape
    useEffect(() => {
        const handleOrientationChange = () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            if (!isPortrait && showRotateGuide) {
                setShowRotateGuide(false);
            }
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, [showRotateGuide]);

    // Auto-scroll carousel only on mount/first active
    useEffect(() => {
        if (!hasAutoScrolled.current && selectedCameras.length > 0 && allCameras.length > 0) {
            // Cari kamera aktif pertama
            const firstActive = allCameras.findIndex(cam => selectedCameras.some(item => item.camera.id === cam.id));
            if (firstActive !== -1 && carouselRef.current) {
                const child = carouselRef.current.children[firstActive] as HTMLElement | undefined;
                if (child) {
                    child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    hasAutoScrolled.current = true;
                }
            }
        }
        // Reset flag jika semua kamera nonaktif
        if (selectedCameras.length === 0) {
            hasAutoScrolled.current = false;
        }
    }, [selectedCameras, allCameras]);

    // Handle initial camera selection: URL query > localStorage > default
    useEffect(() => {
        if (allCameras.length > 0) {
            console.log('Processing camera selection with', {
                allCameras: allCameras.length,
                searchParams: Object.fromEntries(searchParams),
                localStorage: !!localStorage.getItem('mobileCamera_selectedCameras')
            });

            // Check URL query first - this takes priority over localStorage
            const cameraQuery = searchParams.get('camera') || searchParams.get('id'); // Support both 'camera' and 'id' parameters
            const layoutQuery = searchParams.get('layout');

            console.log('Checking URL queries:', { cameraQuery, layoutQuery });

            if (cameraQuery) {
                const camera = allCameras.find(c => c.id === cameraQuery);
                if (camera) {
                    console.log('Found camera from URL query (priority):', camera);

                    // Smart camera addition logic based on layout and existing cameras
                    const currentLayout = viewLayout; // Use current layout
                    const savedCameras = localStorage.getItem('mobileCamera_selectedCameras');
                    let existingCameras: SelectedCamera[] = [];

                    // Try to get existing cameras from localStorage
                    if (savedCameras) {
                        try {
                            const parsed = JSON.parse(savedCameras);
                            existingCameras = parsed.filter((item: SelectedCamera) =>
                                allCameras.some(cam => cam.id === item.camera.id)
                            );
                        } catch {
                            console.warn('Invalid saved camera state');
                        }
                    }

                    // Check if camera is already selected
                    const isAlreadySelected = existingCameras.some(item => item.camera.id === camera.id);

                    if (currentLayout === 1) {
                        // Layout 1: Always replace with new camera
                        console.log('Layout 1: Replacing with new camera');
                        setSelectedCameras([{ camera, position: 0, aspectMode: 'contain' }]);
                    } else if (isAlreadySelected) {
                        // Camera already exists: keep existing cameras
                        console.log('Camera already selected, keeping existing cameras');
                        setSelectedCameras(existingCameras);
                    } else {
                        // Multi-layout: Add to next available slot or replace if full
                        const nextPosition = existingCameras.length;
                        if (nextPosition < currentLayout) {
                            // Add to next available slot
                            console.log(`Adding camera to slot ${nextPosition}`);
                            const newCameras = [...existingCameras, { camera, position: nextPosition, aspectMode: 'contain' as const }];
                            setSelectedCameras(newCameras);
                        } else {
                            // All slots full: replace the first one (position 0)
                            console.log('All slots full, replacing first camera');
                            const newCameras = existingCameras.map((item, index) =>
                                index === 0
                                    ? { camera, position: 0, aspectMode: 'contain' as const }
                                    : item
                            );
                            setSelectedCameras(newCameras);
                        }
                    }

                    if (layoutQuery) {
                        const layout = parseInt(layoutQuery) as ViewLayout;
                        if ([1, 2, 4].includes(layout)) {
                            setViewLayout(layout);
                        }
                    }

                    // Clear URL queries after processing
                    setSearchParams({}, { replace: true });
                    return;
                } else {
                    console.warn('Camera not found for ID:', cameraQuery);
                }
            }

            // Fallback to localStorage if no URL query
            const savedCameras = localStorage.getItem('mobileCamera_selectedCameras');
            if (savedCameras) {
                try {
                    const parsed = JSON.parse(savedCameras);
                    // Validate saved cameras still exist
                    const validCameras = parsed.filter((item: SelectedCamera) =>
                        allCameras.some(cam => cam.id === item.camera.id)
                    );
                    if (validCameras.length > 0) {
                        console.log('Using localStorage cameras (fallback):', validCameras);
                        setSelectedCameras(validCameras);
                        return;
                    }
                } catch {
                    console.warn('Invalid saved camera state');
                }
            }

            // No URL query and no valid localStorage - use default (empty)
            console.log('No URL query or localStorage - using default empty state');
        }
    }, [allCameras, searchParams, setSearchParams, viewLayout]);

    const fetchCameras = async () => {
        try {
            const response = await getActiveCameras();
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

    const toggleCameraFullscreen = async (cameraId: string) => {
        const newFullscreen = !isFullscreen || fullscreenCameraId !== cameraId;
        setIsFullscreen(newFullscreen);
        setFullscreenCameraId(newFullscreen ? cameraId : null);

        if (newFullscreen) {
            // Entering fullscreen
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isPortrait = window.innerHeight > window.innerWidth;

            if (isMobile && isPortrait) {
                setShowRotateGuide(true);
            }
        } else {
            // Exiting fullscreen
            setShowRotateGuide(false);
        }
    };

    const handleDoubleClick = (cameraId: string) => {
        toggleCameraFullscreen(cameraId);
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
            const isNonRealtime = !selectedCamera.camera.realtime;

            return (
                <div key={position} className={`relative bg-[#24252d] rounded-lg overflow-hidden group flex flex-col min-h-0 ${viewLayout === 2 ? 'max-h-[25dvh]' : ''}`}>
                    <div
                        onDoubleClick={() => handleDoubleClick(selectedCamera.camera.id)}
                        className="w-full h-full cursor-pointer"
                    >
                        <VideoPlayer
                            src={selectedCamera.camera.streamUrl}
                            autoPlay
                            muted
                            controls={false}
                            className={`w-full h-full ${selectedCamera.aspectMode === 'cover' ? 'object-cover' : 'object-contain'}`}
                        />
                    </div>

                    {/* Camera Name */}
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-xs">
                        {selectedCamera.camera.name}
                    </div>

                    {/* Non-Realtime Alert Overlay - Bottom Full Width */}
                    {isNonRealtime && (
                        <div className="absolute bottom-0 left-0 right-0 bg-orange-500/90 backdrop-blur-md border-t border-orange-400 pointer-events-none">
                            <div className="px-2 py-1 text-center text-white">
                                <div className={`font-medium ${viewLayout === 1 ? 'text-base' :
                                    viewLayout === 2 ? 'text-xs' :
                                        'text-[10px]'
                                    }`}>
                                    Camera ini sedang tidak realtime
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => toggleCameraFullscreen(selectedCamera.camera.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            title="Fullscreen"
                        >
                            ⛶
                        </button>
                        {!isFullscreen && (
                            <button
                                onClick={() => removeCameraFromSlot(position)}
                                className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            >
                                ×
                            </button>
                        )}
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

    return (
        <div className={`bg-[#0e0e17] text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'flex flex-col'}`}>
            <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 pt-3.5 pb-6 flex flex-col min-h-[100dvh]'}`}>
                {!isFullscreen && (
                    <header className="mb-4">
                        <div className="flex items-center justify-between mb-6">
                            <Link to="/" className="bg-[#24252d] p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold">Control Center</h1>
                            <div className="w-[2rem]"></div>
                        </div>

                        <div className="md:hidden">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300">Layout</h3>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 4].map((layout) => (
                                        <button
                                            key={layout}
                                            onClick={() => handleLayoutChange(layout as ViewLayout)}
                                            className={`w-10 h-10 rounded-xl border-2 transition-colors font-bold text-sm ${viewLayout === layout
                                                ? 'bg-gray-900 text-white border-gray-700'
                                                : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-300'
                                                }`}
                                        >
                                            {layout}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Video Grid - 70% space */}
                <div className={`${isFullscreen ? 'h-full' : 'flex mb-4 flex-1 min-h-0'} relative`}>
                    {isFullscreen && fullscreenCameraId ? (
                        // Fullscreen mode: show only selected camera
                        <div className="w-full h-full relative">
                            {(() => {
                                const fullscreenCamera = selectedCameras.find(item => item.camera.id === fullscreenCameraId);
                                if (fullscreenCamera) {
                                    const isNonRealtime = !fullscreenCamera.camera.realtime;

                                    return (
                                        <div
                                            onDoubleClick={() => handleDoubleClick(fullscreenCamera.camera.id)}
                                            className="w-full h-full cursor-pointer relative bg-[#24252d] rounded-lg overflow-hidden"
                                        >
                                            <VideoPlayer
                                                src={fullscreenCamera.camera.streamUrl}
                                                autoPlay
                                                muted
                                                controls={false}
                                                className={`w-full h-full ${fullscreenCamera.aspectMode === 'cover' ? 'object-cover' : 'object-contain'}`}
                                            />

                                            {/* Camera Name */}
                                            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-xs">
                                                {fullscreenCamera.camera.name}
                                            </div>

                                            {/* Non-Realtime Alert for Fullscreen */}
                                            {isNonRealtime && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-orange-500/90 backdrop-blur-md border-t border-orange-400 pointer-events-none">
                                                    <div className="px-4 py-2 text-center text-white">
                                                        <div className="font-medium text-lg">
                                                            Camera ini sedang tidak realtime
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Exit Fullscreen Button */}
                                            <button
                                                onClick={() => toggleCameraFullscreen(fullscreenCamera.camera.id)}
                                                className="absolute top-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-full transition-colors z-20"
                                                aria-label="Exit Fullscreen"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    ) : (
                        // Grid mode: show all cameras
                        <div className={`grid flex-1 ${getGridClass()} gap-2 w-full min-h-0`}>
                            {Array.from({ length: viewLayout }, (_, index) => renderCameraSlot(index))}
                        </div>
                    )}

                    {/* Rotation Guide Overlay */}
                    {isFullscreen && showRotateGuide && (
                        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10">
                            <div className="text-center text-white px-8">
                                <div className="mb-6">
                                    <div className="flex items-center justify-center space-x-4 mb-4">
                                        <div className="w-16 h-10 border-2 border-blue-400 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-400 text-xs">📱</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <div className="w-10 h-16 border-2 border-blue-400 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-400 text-xs">📱</span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">Rotate Your Phone</h3>
                                <p className="text-gray-300 text-lg mb-6">
                                    Turn your device to landscape mode<br />
                                    for the best viewing experience
                                </p>
                                <div className="text-blue-400 text-sm">
                                    🔄 Rotate to continue watching
                                </div>
                            </div>
                        </div>
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
                            <div ref={carouselRef} className="flex gap-3 overflow-x-auto py-3 scrollbar-hide snap-x snap-mandatory">
                                {allCameras.map((cam) => {
                                    const isActive = selectedCameras.some(item => item.camera.id === cam.id);
                                    const canSelect = canSelectCamera(cam);

                                    return (
                                        <div
                                            key={cam.id}
                                            onClick={() => canSelect && handleCameraSelect(cam)}
                                            className={`flex-shrink-0 w-36 h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 snap-start ${!canSelect
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isActive && cam.realtime
                                                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 scale-105'
                                                    : isActive && !cam.realtime
                                                        ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900 scale-105'
                                                        : 'hover:ring-2 hover:ring-gray-500 hover:ring-offset-2 ring-offset-gray-900 hover:scale-105'
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
                                                        <div className={`w-3 h-3 ${cam.realtime ? 'bg-blue-500' : 'bg-orange-500'} rounded-full animate-pulse shadow-lg border-2 border-white`}></div>
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
