import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { getCameraById } from '../services/cameraService';
import type { Camera } from '../types';

const CameraDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [camera, setCamera] = useState<Camera | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchCamera = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const response = await getCameraById(id);

                if (response.success && response.data) {
                    setCamera(response.data);
                } else {
                    setError(response.message || 'Kamera tidak ditemukan');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat memuat data kamera');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCamera();
    }, [id]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !camera) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="bg-red-900 p-6 rounded-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p className="mb-6">{error || 'Kamera tidak ditemukan'}</p>
                    <Link to="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md inline-block">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
            <div className={`container mx-auto ${isFullscreen ? 'h-full' : 'px-4 py-8'}`}>
                {!isFullscreen && (
                    <header className="mb-6">
                        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Kembali ke Beranda
                        </Link>
                        <h1 className="text-3xl font-bold">{camera.name}</h1>
                    </header>
                )}

                <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video rounded-lg overflow-hidden shadow-lg'}`}>
                    <VideoPlayer
                        src={camera.streamUrl}
                        autoPlay
                        muted={false}
                        controls
                    />

                    <button
                        onClick={toggleFullscreen}
                        className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-full transition-colors"
                        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        )}
                    </button>
                </div>

                {!isFullscreen && (
                    <div className="mt-6">
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">Informasi Kamera</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-400 mb-1">ID Kamera</h3>
                                    <p>{camera.id}</p>
                                </div>
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-400 mb-1">Stream URL</h3>
                                    <p className="truncate">{camera.streamUrl}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraDetailPage;
