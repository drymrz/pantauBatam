import { useState, useEffect } from 'react';
import { getAllCameras, deleteCamera } from '../../services/cameraService';
import CameraForm from '../../components/admin/CameraForm';
import type { Camera } from '../../types';
import { Link } from 'react-router-dom';

const AdminCamerasPage = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddingCamera, setIsAddingCamera] = useState(false);
    const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

    const fetchCameras = async () => {
        setLoading(true);
        try {
            const response = await getAllCameras();
            if (response.success && response.data) {
                setCameras(response.data);
            } else {
                setError(response.message || 'Failed to fetch cameras');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching cameras');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const handleAddCamera = () => {
        setIsAddingCamera(true);
        setEditingCamera(null);
    };

    const handleEditCamera = (camera: Camera) => {
        setEditingCamera(camera);
        setIsAddingCamera(false);
    };

    const handleDeleteCamera = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this camera?')) {
            try {
                const response = await deleteCamera(id);
                if (response.success) {
                    fetchCameras();
                } else {
                    setError(response.message || 'Failed to delete camera');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while deleting camera');
            }
        }
    };

    const handleFormSuccess = () => {
        setIsAddingCamera(false);
        setEditingCamera(null);
        fetchCameras();
    };

    const handleFormCancel = () => {
        setIsAddingCamera(false);
        setEditingCamera(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Cameras</h1>
                <div className="flex space-x-4">
                    <Link
                        to="/admin"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={handleAddCamera}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                        disabled={isAddingCamera || editingCamera !== null}
                    >
                        Add New Camera
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
                    {error}
                    <button
                        className="ml-2 text-red-600 font-medium"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {isAddingCamera && (
                <div className="mb-8">
                    <CameraForm
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                </div>
            )}

            {editingCamera && (
                <div className="mb-8">
                    <CameraForm
                        camera={editingCamera}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : cameras.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No cameras found. Add your first camera to get started.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stream URL
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cameras.map((camera) => (
                                <tr key={camera.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {camera.thumbnail && (
                                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                    <img
                                                        className="h-10 w-10 rounded-md object-cover"
                                                        src={camera.thumbnail}
                                                        alt={camera.name}
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{camera.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {camera.streamUrl}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 truncate max-w-xs">{camera.streamUrl}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditCamera(camera)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCamera(camera.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCamerasPage;
