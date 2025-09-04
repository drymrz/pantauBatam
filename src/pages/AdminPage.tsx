import { useState, useEffect } from 'react';
import { getAllCameras, deleteCamera } from '../services/cameraService';
import type { Camera } from '../types';
import CameraForm from '../components/admin/CameraForm';

const AdminPage = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(true);

    // Fetch cameras
    const fetchCameras = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getAllCameras();

            if (response.success) {
                setCameras(response.data);
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

    useEffect(() => {
        fetchCameras();
    }, []);

    // Handle camera edit
    const handleEdit = (camera: Camera) => {
        setSelectedCamera(camera);
        setIsCreateMode(false);
        setIsFormOpen(true);
    };

    // Handle camera delete
    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this camera?')) {
            return;
        }

        try {
            setError(null);
            const response = await deleteCamera(id);

            if (response.success) {
                setCameras(cameras.filter(camera => camera.id !== id));
                alert('Camera deleted successfully');
            } else {
                setError(response.message || 'Failed to delete camera');
            }
        } catch (err) {
            setError('An unexpected error occurred while deleting the camera');
            console.error(err);
        }
    };

    // Handle form close
    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedCamera(null);
    };

    // Handle form success
    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setSelectedCamera(null);
        fetchCameras();
    };

    // Handle create new
    const handleCreateNew = () => {
        setSelectedCamera(null);
        setIsCreateMode(true);
        setIsFormOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">PantauBatam Admin</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleCreateNew}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New Camera
                            </button>
                            <a
                                href="/"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Site
                            </a>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
                        <p>{error}</p>
                        <button
                            className="mt-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-md"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700 text-left">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stream URL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {cameras.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                                                No cameras found. Click "Add New Camera" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        cameras.map(camera => (
                                            <tr key={camera.id} className="hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{camera.id.substring(0, 8)}...</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{camera.name}</td>
                                                <td className="px-6 py-4 text-sm truncate max-w-xs">{camera.streamUrl}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{camera.location || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${camera.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {camera.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(camera)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(camera.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Camera Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {isCreateMode ? 'Add New Camera' : 'Edit Camera'}
                                </h2>
                                <button
                                    onClick={handleFormClose}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <CameraForm
                                camera={selectedCamera}
                                isCreateMode={isCreateMode}
                                onClose={handleFormClose}
                                onSuccess={handleFormSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
