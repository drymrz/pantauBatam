
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CameraCard from "../components/CameraCard";
import { getAllCameras } from "../services/cameraService";
import { useScreenSize, SCREEN_SIZE } from "../hooks/useScreenSize";
import type { Camera } from "../types";

const HomePage = () => {
    const navigate = useNavigate();
    const screenSize = useScreenSize();
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                setIsLoading(true);
                const response = await getAllCameras();

                if (response.success && response.data) {
                    setCameras(response.data);
                } else {
                    setError(response.message || "Failed to fetch cameras");
                }
            } catch (err) {
                setError("An unexpected error occurred");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCameras();
    }, []);

    // Filter kamera berdasarkan pencarian
    const filteredCameras = cameras.filter(camera =>
        camera.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDesktopOrTablet = screenSize === SCREEN_SIZE.DESKTOP || screenSize === SCREEN_SIZE.TABLET;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex justify-center md:justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">PantauBatam</h1>

                        {isDesktopOrTablet && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Camera Center
                            </button>
                        )}
                    </div>

                    <p className="text-gray-400 text-center mb-6">Pantau situasi terkini di kota Batam melalui jaringan CCTV publik</p>

                    {/* Search bar */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-600 rounded-lg bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cari kamera berdasarkan nama..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <main>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-900 text-white p-4 rounded-lg max-w-md mx-auto">
                            <p>{error}</p>
                            <button
                                className="mt-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-md"
                                onClick={() => window.location.reload()}
                            >
                                Coba Lagi
                            </button>
                        </div>
                    ) : (
                        <>
                            {filteredCameras.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-xl text-gray-400">Tidak ada kamera yang ditemukan</p>
                                    {searchTerm && (
                                        <button
                                            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                                            onClick={() => setSearchTerm("")}
                                        >
                                            Reset Pencarian
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className={`grid gap-6 ${isDesktopOrTablet
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    }`}>
                                    {filteredCameras.map(camera => (
                                        <CameraCard
                                            key={camera.id}
                                            camera={camera}
                                            onClick={isDesktopOrTablet ? () => navigate(`/dashboard?camera=${camera.id}`) : undefined}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <footer className="bg-gray-800 py-6 mt-12">
                <div className="container mx-auto px-4">
                    <p className="text-center text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} PantauBatam. All rights reserved.
                    </p>
                    <p className="text-center text-gray-500 text-xs mt-2">
                        Stream CCTV disediakan oleh Dinas Perhubungan Kota Batam
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

