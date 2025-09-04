import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCameras } from '../services/cameraService';
import { useScreenSize, SCREEN_SIZE } from '../hooks/useScreenSize';
import type { Camera } from '../types';
import VideoPlayer from './VideoPlayer';
import ThumbnailGenerator from './ThumbnailGenerator';

type ViewLayout = 1 | 2 | 4 | 9 | 16;

interface SelectedCamera {
    camera: Camera;
    position: number;
    aspectMode: 'cover' | 'contain';
}

const ControlCenter = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const screenSize = useScreenSize();
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [viewLayout, setViewLayout] = useState<ViewLayout>(1);
    const [selectedCameras, setSelectedCameras] = useState<SelectedCamera[]>([]);

    // Redirect mobile users to homepage
    useEffect(() => {
        if (screenSize === SCREEN_SIZE.MOBILE) {
            navigate('/', { replace: true });
        }
    }, [screenSize, navigate]);

    useEffect(() => {
        fetchCameras();
    }, []);

    // Handle initial camera selection from URL parameter
    useEffect(() => {
        const cameraId = searchParams.get('camera');
        if (cameraId && cameras.length > 0) {
            const camera = cameras.find(c => c.id === cameraId);
            if (camera) {
                setSelectedCameras([{ camera, position: 0, aspectMode: 'contain' }]);
            }
        }
    }, [cameras, searchParams]);

    const fetchCameras = async () => {
        try {
            setLoading(true);
            const response = await getAllCameras();
            if (response.success && response.data) {
                setCameras(response.data);
            } else {
                setError(response.message || 'Failed to fetch cameras');
            }
        } catch {
            setError('An error occurred while fetching cameras');
        } finally {
            setLoading(false);
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
            // Multi view mode - add to next available slot or replace if full
            const nextPosition = selectedCameras.length;
            if (nextPosition < viewLayout) {
                setSelectedCameras(prev => [...prev, { camera, position: nextPosition, aspectMode: 'contain' }]);
            } else {
                // All slots filled, replace first one and shift others
                setSelectedCameras(prev => {
                    const newSelection = prev.slice(1).map(item => ({
                        ...item,
                        position: item.position - 1
                    }));
                    return [...newSelection, { camera, position: viewLayout - 1, aspectMode: 'contain' }];
                });
            }
        }
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
            case 2: return 'grid-cols-2 grid-rows-1';
            case 4: return 'grid-cols-2 grid-rows-2';
            case 9: return 'grid-cols-3 grid-rows-3';
            case 16: return 'grid-cols-4 grid-rows-4';
            default: return 'grid-cols-1 grid-rows-1';
        }
    };

    const renderCameraSlot = (position: number) => {
        const selectedCamera = selectedCameras.find(item => item.position === position);

        if (selectedCamera) {
            return (
                <div key={position} className="relative bg-gray-900 rounded-lg overflow-hidden group">
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
                            {selectedCamera.aspectMode === 'cover' ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-fullscreen-exit" viewBox="0 0 16 16">
                                <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
                            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrows-fullscreen" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707" />
                            </svg>}
                        </button>
                        <button
                            onClick={() => removeCameraFromSlot(position)}
                            className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={position}
                className="bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-gray-500 transition-colors"
                onClick={() => {
                    if (sidebarCollapsed) {
                        setSidebarCollapsed(false);
                    }
                }}
            >
                <div className="text-center">
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-sm">
                        {sidebarCollapsed ? 'Klik untuk buka sidebar' : 'Pilih kamera dari sidebar'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-gray-800 transition-all duration-300 flex-shrink-0 h-full flex flex-col`}>
                <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        {!sidebarCollapsed && <h1 className="text-xl font-bold">Camera Center</h1>}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 hover:bg-gray-700 rounded"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                            </svg>
                        </button>
                    </div>

                    {!sidebarCollapsed && (
                        <>
                            {/* Camera List - flex grow */}
                            <div className="flex-1 mb-4 min-h-0">
                                <div className="h-full overflow-y-auto space-y-2">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : error ? (
                                        <div className="text-red-400 text-sm">{error}</div>
                                    ) : (
                                        cameras.map((camera) => {
                                            const isActive = selectedCameras.some(item => item.camera.id === camera.id);
                                            return (
                                                <div
                                                    key={camera.id}
                                                    onClick={() => handleCameraSelect(camera)}
                                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive
                                                        ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400'
                                                        : 'bg-gray-700 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    <div className="w-12 h-8 bg-gray-600 rounded mr-3 flex-shrink-0 overflow-hidden">
                                                        {camera.thumbnail ? (
                                                            <img
                                                                src={camera.thumbnail}
                                                                alt={camera.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <ThumbnailGenerator cameraName={camera.name} className="text-xs" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{camera.name}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {isActive ? 'Active' : 'Live'}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Layout Controls - stick to bottom */}
                            <div className="flex-shrink-0">
                                <h2 className="text-lg font-semibold mb-3">Layout</h2>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 4, 9, 16].map((layout) => (
                                        <button
                                            key={layout}
                                            onClick={() => handleLayoutChange(layout as ViewLayout)}
                                            className={`p-3 rounded-lg border-2 transition-colors ${viewLayout === layout
                                                ? 'border-blue-500 bg-blue-600'
                                                : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-lg font-bold">{layout}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content - Full Height */}
            <div className="flex-1 p-4 h-full">
                <div className={`grid ${getGridClass()} gap-2 h-full w-full`}>
                    {Array.from({ length: viewLayout }, (_, index) => renderCameraSlot(index))}
                </div>
            </div>
        </div>
    );
};

export default ControlCenter;
