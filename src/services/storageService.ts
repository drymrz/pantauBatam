import { supabase } from '../config/supabase';

export const uploadThumbnail = async (file: File, fileName: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        // Upload file ke bucket 'thumbnail'
        const { data, error } = await supabase.storage
            .from('thumbnail')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: error.message };
        }

        // Dapatkan public URL dari file yang diupload
        const { data: urlData } = supabase.storage
            .from('thumbnail')
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error in uploadThumbnail:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const deleteThumbnail = async (fileName: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.storage
            .from('thumbnail')
            .remove([fileName]);

        if (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in deleteThumbnail:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
