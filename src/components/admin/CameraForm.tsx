import { useState, useEffect } from 'react';
import { addCamera, updateCamera } from '../../services/cameraService';
import { uploadThumbnail } from '../../services/storageService';
import type { Camera } from '../../types/index';

interface CameraFormProps {
    camera?: Camera | null;
    onSuccess: () => void;
    onClose: () => void;
}

const CameraForm = ({ camera, onSuccess, onClose }: CameraFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        streamUrl: '',
        thumbnail: '',
        isActive: true,
        realtime: true
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (camera) {
            setFormData({
                name: camera.name,
                streamUrl: camera.streamUrl,
                thumbnail: camera.thumbnail || '',
                isActive: camera.isActive,
                realtime: camera.realtime
            });
            setThumbnailPreview(camera.thumbnail || '');
        }
    }, [camera]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            // Buat preview URL
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let thumbnailUrl = formData.thumbnail;

            // Upload thumbnail jika ada file baru
            if (thumbnailFile) {
                const fileName = `${Date.now()}-${thumbnailFile.name}`;
                const uploadResult = await uploadThumbnail(thumbnailFile, fileName);

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || 'Failed to upload thumbnail');
                }

                thumbnailUrl = uploadResult.url || '';
            }

            const cameraData = {
                ...formData,
                thumbnail: thumbnailUrl
            };

            if (camera?.id) {
                // Update existing camera
                const response = await updateCamera(camera.id, cameraData);

                if (!response.success) {
                    throw new Error(response.message || 'Failed to update camera');
                }
            } else {
                // Add new camera
                const response = await addCamera(cameraData);

                if (!response.success) {
                    throw new Error(response.message || 'Failed to add camera');
                }
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {error && (
                <div className="mb-4 p-4 bg-red-900 text-red-100 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Camera Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter camera name"
                    />
                </div>

                <div>
                    <label htmlFor="streamUrl" className="block text-sm font-medium text-gray-300 mb-1">
                        Stream URL
                    </label>
                    <textarea
                        id="streamUrl"
                        name="streamUrl"
                        value={formData.streamUrl}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter stream URL (e.g., rtmp://example.com/stream)"
                    />
                </div>

                <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300 mb-1">
                        Thumbnail Image
                    </label>
                    <input
                        type="file"
                        id="thumbnail"
                        name="thumbnail"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {thumbnailPreview && (
                        <div className="mt-2">
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-32 h-24 object-cover rounded-md border border-gray-600"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span>Camera is Active</span>
                        </label>
                    </div>
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                            <input
                                type="checkbox"
                                name="realtime"
                                checked={formData.realtime}
                                onChange={(e) => setFormData(prev => ({ ...prev, realtime: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span>Realtime Stream</span>
                        </label>
                    </div>
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? (camera ? 'Updating...' : 'Adding...')
                            : (camera ? 'Update Camera' : 'Add Camera')
                        }
                    </button>
                </div>
            </form>
        </>
    );
};

export default CameraForm;
