import type { Camera, ApiResponse } from '../types';
import { supabase } from '../config/supabase';

// Fungsi untuk mengambil semua kamera
export const getAllCameras = async (): Promise<ApiResponse<Camera[]>> => {
    try {
        const { data, error } = await supabase
            .from('cameras')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cameras:', error);
            return {
                success: false,
                message: error.message
            };
        }

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Error fetching cameras:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// Fungsi untuk mengambil kamera berdasarkan ID
export const getCameraById = async (id: string): Promise<ApiResponse<Camera | null>> => {
    try {
        const { data, error } = await supabase
            .from('cameras')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    success: false,
                    data: null,
                    message: `Camera with ID ${id} not found`
                };
            }
            console.error(`Error fetching camera with ID ${id}:`, error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error(`Error fetching camera with ID ${id}:`, error);
        return {
            success: false,
            data: null,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// Fungsi untuk menambahkan kamera baru
export const addCamera = async (camera: Omit<Camera, 'id'>): Promise<ApiResponse<Camera>> => {
    try {
        const { data, error } = await supabase
            .from('cameras')
            .insert([{
                name: camera.name,
                streamUrl: camera.streamUrl,
                thumbnail: camera.thumbnail
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding camera:', error);
            return {
                success: false,
                data: {} as Camera,
                message: error.message
            };
        }

        return {
            success: true,
            data: data,
            message: 'Camera added successfully'
        };
    } catch (error) {
        console.error('Error adding camera:', error);
        return {
            success: false,
            data: {} as Camera,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// Fungsi untuk mengupdate kamera
export const updateCamera = async (id: string, camera: Partial<Camera>): Promise<ApiResponse<Camera>> => {
    try {
        const { data, error } = await supabase
            .from('cameras')
            .update({
                name: camera.name,
                streamUrl: camera.streamUrl,
                thumbnail: camera.thumbnail
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    success: false,
                    data: {} as Camera,
                    message: `Camera with ID ${id} not found`
                };
            }
            console.error(`Error updating camera with ID ${id}:`, error);
            return {
                success: false,
                data: {} as Camera,
                message: error.message
            };
        }

        return {
            success: true,
            data: data,
            message: 'Camera updated successfully'
        };
    } catch (error) {
        console.error(`Error updating camera with ID ${id}:`, error);
        return {
            success: false,
            data: {} as Camera,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

// Fungsi untuk menghapus kamera
export const deleteCamera = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
        const { error } = await supabase
            .from('cameras')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting camera with ID ${id}:`, error);
            return {
                success: false,
                data: false,
                message: error.message
            };
        }

        return {
            success: true,
            data: true,
            message: 'Camera deleted successfully'
        };
    } catch (error) {
        console.error(`Error deleting camera with ID ${id}:`, error);
        return {
            success: false,
            data: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
