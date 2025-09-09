import type { Camera, ApiResponse } from '../types';
import * as apiService from './apiService';

// Fungsi untuk mengambil semua kamera
export const getAllCameras = async (): Promise<ApiResponse<Camera[]>> => {
    return apiService.getAllCameras();
};

export const getActiveCameras = async (): Promise<ApiResponse<Camera[]>> => {
    return apiService.getActiveCameras();
};

// Fungsi untuk mengambil detail kamera berdasarkan ID
export const getCameraById = async (id: string): Promise<ApiResponse<Camera | null>> => {
    return apiService.getCameraById(id);
};

// Fungsi untuk menambahkan kamera baru
export const addCamera = async (camera: Omit<Camera, 'id'>): Promise<ApiResponse<Camera>> => {
    return apiService.addCamera(camera);
};

// Fungsi untuk mengupdate kamera
export const updateCamera = async (id: string, camera: Partial<Camera>): Promise<ApiResponse<Camera>> => {
    return apiService.updateCamera(id, camera);
};

// Fungsi untuk menghapus kamera
export const deleteCamera = async (id: string): Promise<ApiResponse<boolean>> => {
    return apiService.deleteCamera(id);
};
