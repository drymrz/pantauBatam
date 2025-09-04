import { useState, useEffect } from 'react';
import { getAllCameras, getCameraById } from '../services/cameraService';
import type { Camera } from '../types';

export const useAllCameras = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                setIsLoading(true);
                const response = await getAllCameras();

                if (response.success && response.data) {
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

        fetchCameras();
    }, []);

    return { cameras, isLoading, error };
};

export const useCameraById = (id: number | string) => {
    const [camera, setCamera] = useState<Camera | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCamera = async () => {
            try {
                setIsLoading(true);
                const cameraId = typeof id === 'string' ? id : String(id);
                const response = await getCameraById(cameraId);

                if (response.success && response.data) {
                    setCamera(response.data);
                } else {
                    setError(response.message || 'Camera not found');
                }
            } catch (err) {
                setError('An unexpected error occurred');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCamera();
    }, [id]);

    return { camera, isLoading, error };
};
