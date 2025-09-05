import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCameras } from '../services/cameraService';
import { useScreenSize, SCREEN_SIZE } from '../hooks/useScreenSize';
import type { Camera } from '../types';
import VideoPlayer from './VideoPlayer';

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
    const [viewLayout, setViewLayout] = useState<ViewLayout>(() => {
        const saved = localStorage.getItem('cameraCenter_layout');
        return saved ? (parseInt(saved) as ViewLayout) : 1;
    });
    const [selectedCameras, setSelectedCameras] = useState<SelectedCamera[]>(() => {
        const saved = localStorage.getItem('cameraCenter_selectedCameras');
        return saved ? JSON.parse(saved) : [];
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Redirect mobile users to homepage
    useEffect(() => {
        if (screenSize === SCREEN_SIZE.MOBILE) {
            navigate('/', { replace: true });
        }
    }, [screenSize, navigate]);

    // Save layout to localStorage
    useEffect(() => {
        localStorage.setItem('cameraCenter_layout', viewLayout.toString());
    }, [viewLayout]);

    // Save selected cameras to localStorage
    useEffect(() => {
        localStorage.setItem('cameraCenter_selectedCameras', JSON.stringify(selectedCameras));
    }, [selectedCameras]);

    useEffect(() => {
        fetchCameras();
    }, []);

    // Handle initial camera selection: prioritize URL query over localStorage
    useEffect(() => {
        if (cameras.length > 0) {
            const cameraId = searchParams.get('camera');
            console.log('🎬 ControlCenter Effect - Camera ID from URL:', cameraId);
            console.log('🎬 ControlCenter Effect - Current layout:', viewLayout);

            // If camera clicked from HomePage, prioritize it
            if (cameraId) {
                const newCamera = cameras.find(c => c.id === cameraId);
                console.log('🎬 Found camera from URL:', newCamera?.name);

                if (newCamera) {
                    // Load existing state from localStorage
                    let existingCameras: SelectedCamera[] = [];
                    const savedCameras = localStorage.getItem('cameraCenter_selectedCameras');
                    if (savedCameras) {
                        try {
                            const parsed = JSON.parse(savedCameras);
                            const validCameras = parsed.filter((item: SelectedCamera) =>
                                cameras.some(cam => cam.id === item.camera.id)
                            );
                            existingCameras = validCameras;
                            console.log('🎬 Existing cameras from localStorage:', existingCameras.map(c => c.camera.name));
                        } catch {
                            console.warn('Invalid saved camera state');
                        }
                    }

                    // Check if clicked camera already exists
                    const existingIndex = existingCameras.findIndex(item => item.camera.id === cameraId);
                    console.log('🎬 Camera already exists at index:', existingIndex);

                    if (existingIndex !== -1) {
                        // Camera already exists - just use current state (no change needed)
                        console.log('🎬 Camera exists, using current state');
                        setSelectedCameras(existingCameras);
                    } else {
                        // New camera from home - always add/replace based on layout
                        if (viewLayout === 1) {
                            // Layout 1: Replace whatever is there
                            console.log('🎬 Layout 1: Replacing with new camera');
                            setSelectedCameras([{ camera: newCamera, position: 0, aspectMode: 'contain' }]);
                        } else {
                            // Multi layout: Add to available slot or replace if full
                            if (existingCameras.length < viewLayout) {
                                // Has space - add to next available position
                                const occupiedPositions = existingCameras.map(item => item.position);
                                const availablePosition = Array.from({ length: viewLayout }, (_, i) => i)
                                    .find(pos => !occupiedPositions.includes(pos)) || 0;

                                console.log('🎬 Multi layout: Adding to position', availablePosition);
                                setSelectedCameras([
                                    ...existingCameras,
                                    { camera: newCamera, position: availablePosition, aspectMode: 'contain' }
                                ]);
                            } else {
                                // All slots full - replace first camera (position 0)
                                const updatedCameras = existingCameras.filter(item => item.position !== 0);
                                console.log('🎬 Multi layout: Replacing position 0');
                                setSelectedCameras([
                                    { camera: newCamera, position: 0, aspectMode: 'contain' },
                                    ...updatedCameras
                                ]);
                            }
                        }
                    }

                    // Clear URL query parameter after successful initial load from URL
                    console.log('🔄 Initial load from URL complete, clearing query parameter');
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete('camera');
                    window.history.replaceState({}, '', `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`);

                    return; // Skip localStorage-only handling
                }
            }

            // No camera from URL - load from localStorage only
            console.log('🎬 No camera from URL, loading from localStorage');
            let savedState: SelectedCamera[] = [];
            const savedCameras = localStorage.getItem('cameraCenter_selectedCameras');
            if (savedCameras) {
                try {
                    const parsed = JSON.parse(savedCameras);
                    const validCameras = parsed.filter((item: SelectedCamera) =>
                        cameras.some(cam => cam.id === item.camera.id)
                    );
                    savedState = validCameras;
                    console.log('🎬 Loaded from localStorage:', savedState.map(c => c.camera.name));
                } catch {
                    console.warn('Invalid saved camera state');
                }
            }
            setSelectedCameras(savedState);
        }
    }, [cameras, searchParams, viewLayout]); const fetchCameras = async () => {
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
        // Clear URL query parameter when user manually selects camera
        if (searchParams.get('camera')) {
            console.log('🔄 Clearing camera query parameter after manual selection');
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('camera');
            window.history.replaceState({}, '', `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`);
        }

        // Check if camera is already selected - if yes, remove it (toggle)
        const existingCameraIndex = selectedCameras.findIndex(item => item.camera.id === camera.id);
        if (existingCameraIndex !== -1) {
            // Remove camera but keep position fixed (don't reorder)
            setSelectedCameras(prev =>
                prev.filter(item => item.camera.id !== camera.id)
            );
            return;
        }

        if (viewLayout === 1) {
            // Single view mode - replace the only slot
            setSelectedCameras([{ camera, position: 0, aspectMode: 'contain' }]);
        } else {
            // Multi view mode - find next available slot
            const occupiedPositions = selectedCameras.map(item => item.position);
            const availablePosition = Array.from({ length: viewLayout }, (_, i) => i)
                .find(pos => !occupiedPositions.includes(pos));

            if (availablePosition !== undefined) {
                setSelectedCameras(prev => [...prev, {
                    camera,
                    position: availablePosition,
                    aspectMode: 'contain'
                }]);
            }
            // If no available position, do nothing (don't replace)
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
        // Remove camera but keep positions fixed (don't reorder other cameras)
        setSelectedCameras(prev =>
            prev.filter(item => item.position !== position)
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

    // Drag & Drop functionality
    const handleDragStart = (e: React.DragEvent, camera: SelectedCamera) => {
        e.dataTransfer.setData('application/json', JSON.stringify(camera));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetPosition: number) => {
        e.preventDefault();

        try {
            const draggedCamera = JSON.parse(e.dataTransfer.getData('application/json')) as SelectedCamera;
            const targetCamera = selectedCameras.find(item => item.position === targetPosition);

            if (draggedCamera.position === targetPosition) return; // Same position

            setSelectedCameras(prev => {
                return prev.map(item => {
                    // Swap positions
                    if (item.position === draggedCamera.position) {
                        return { ...item, position: targetPosition };
                    }
                    if (targetCamera && item.position === targetPosition) {
                        return { ...item, position: draggedCamera.position };
                    }
                    return item;
                });
            });
        } catch (error) {
            console.error('Drop error:', error);
        }
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
                <div
                    key={position}
                    className="relative bg-gray-900 rounded-lg overflow-hidden group cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, selectedCamera)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, position)}
                >
                    <VideoPlayer
                        src={selectedCamera.camera.streamUrl}
                        autoPlay
                        muted
                        controls={false}
                        className={`w-full h-full ${selectedCamera.aspectMode === 'cover' ? 'object-cover' : 'object-contain'}`}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs pointer-events-none">
                        {selectedCamera.camera.name}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAspectRatio(position);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            title={`Switch to ${selectedCamera.aspectMode === 'cover' ? 'contain' : 'cover'}`}
                            draggable={false}
                        >
                            {selectedCamera.aspectMode === 'cover' ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-fullscreen-exit" viewBox="0 0 16 16">
                                <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
                            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-arrows-fullscreen" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707" />
                            </svg>}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeCameraFromSlot(position);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            draggable={false}
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
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, position)}
                onClick={() => {
                    if (sidebarCollapsed) {
                        setSidebarCollapsed(false);
                    }
                }}
            >
                <div className="text-center pointer-events-none">
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-sm">
                        {sidebarCollapsed ? 'Klik untuk buka sidebar' : 'Pilih kamera dari sidebar atau drag & drop'}
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
                            {/* Search Input */}
                            <div className="mb-4 px-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari kamera..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 pl-10 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                                    />
                                    <svg
                                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

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
                                        (() => {
                                            // Filter cameras berdasarkan search query
                                            const filteredCameras = cameras.filter(camera =>
                                                camera.name.toLowerCase().includes(searchQuery.toLowerCase())
                                            );

                                            if (filteredCameras.length === 0 && searchQuery) {
                                                return (
                                                    <div className="text-gray-400 text-sm text-center py-8">
                                                        <svg className="mx-auto h-12 w-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        Tidak ada kamera yang ditemukan untuk "{searchQuery}"
                                                    </div>
                                                );
                                            }

                                            return filteredCameras.map((camera) => {
                                                const isActive = selectedCameras.some(item => item.camera.id === camera.id);
                                                const canSelect = canSelectCamera(camera);
                                                return (
                                                    <div
                                                        key={camera.id}
                                                        onClick={() => canSelect && handleCameraSelect(camera)}
                                                        className={`flex items-center p-3 rounded-lg transition-colors ${!canSelect
                                                            ? 'bg-gray-800 opacity-50 cursor-not-allowed'
                                                            : isActive
                                                                ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 cursor-pointer'
                                                                : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
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
                                                                <img
                                                                    src="/thumbnail-placeholder.png"
                                                                    alt={camera.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{camera.name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {!canSelect && !isActive ? 'Slots Full' : isActive ? 'Active' : 'Live'}
                                                            </p>
                                                        </div>
                                                        {isActive && (
                                                            <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                                                        )}
                                                    </div>
                                                );
                                            });
                                        })()
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
