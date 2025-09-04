import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAllCameras } from '../services/cameraService';
import { useScreenSize, SCREEN_SIZE } from '../hooks/useScreenSize';
import type { Camera } from '../types';
import Sidebar from '../components/Sidebar';
import MultiViewGrid, { type GridSize } from '../components/MultiViewGrid';

const DashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const screenSize = useScreenSize();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<Camera[]>([]);
  const [gridSize, setGridSize] = useState<GridSize>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Arahkan ke mobile view jika layar kecil
  const isMobile = screenSize === SCREEN_SIZE.MOBILE;

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setIsLoading(true);
        const response = await getAllCameras();

        if (response.success && response.data) {
          setCameras(response.data);

          // Jika ada ID kamera dari parameter URL, pilih kamera tersebut
          if (id) {
            const camera = response.data.find(cam => cam.id === id);
            if (camera) {
              setSelectedCameras([camera]);
            }
          } else if (response.data.length > 0) {
            // Pilih kamera pertama jika tidak ada ID
            setSelectedCameras([response.data[0]]);
          }
        } else {
          setError(response.message || 'Failed to fetch cameras');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameras();
  }, [id]);

  // Handler untuk memilih kamera
  const handleCameraSelect = (camera: Camera) => {
    if (gridSize === 1) {
      // Jika grid size 1, ganti kamera yang dipilih
      setSelectedCameras([camera]);
    } else {
      // Untuk multiple view, cek apakah kamera sudah dipilih
      const isCameraSelected = selectedCameras.some(c => c.id === camera.id);

      if (isCameraSelected) {
        // Jika sudah dipilih, hapus dari selection
        setSelectedCameras(selectedCameras.filter(c => c.id !== camera.id));
      } else {
        // Jika belum dipilih dan masih ada slot kosong, tambahkan
        if (selectedCameras.length < gridSize) {
          setSelectedCameras([...selectedCameras, camera]);
        } else {
          // Jika grid sudah penuh, ganti kamera paling awal
          const newSelectedCameras = [...selectedCameras];
          newSelectedCameras.shift(); // Hapus kamera pertama
          newSelectedCameras.push(camera); // Tambahkan kamera baru
          setSelectedCameras(newSelectedCameras);
        }
      }
    }
  };

  // Handler untuk mengubah ukuran grid
  const handleGridSizeChange = (size: GridSize) => {
    setGridSize(size);

    // Jika ukuran grid dikurangi, kurangi jumlah kamera yang dipilih
    if (selectedCameras.length > size) {
      setSelectedCameras(selectedCameras.slice(0, size));
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isMobile) {
    // Redirect ke halaman mobile jika layar kecil
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl text-white font-bold mb-4">Control Center hanya tersedia di layar besar</h2>
          <p className="text-gray-400 mb-6">Silahkan gunakan tablet atau desktop untuk mengakses Control Center</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md inline-block text-white">
            Kembali ke Galeri
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-900 p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md inline-block">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Galeri
            </Link>
            <h1 className="text-2xl font-bold">Control Center</h1>
          </div>
          <div>
            <span className="text-sm bg-blue-600 px-2 py-1 rounded-md">
              {selectedCameras.length} kamera dipilih
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          cameras={cameras}
          selectedCameras={selectedCameras}
          onCameraSelect={handleCameraSelect}
          gridSize={gridSize}
          onGridSizeChange={handleGridSizeChange}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden">
          <MultiViewGrid
            selectedCameras={selectedCameras}
            gridSize={gridSize}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;