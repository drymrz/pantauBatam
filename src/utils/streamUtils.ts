// Utility untuk mengatasi mixed content issues dengan Vercel Edge Functions
export const getSecureStreamUrl = (originalUrl: string): string => {
    // Jika sudah HTTPS, return as is
    if (originalUrl.startsWith('https://')) {
        return originalUrl;
    }

    // Jika HTTP dan sedang di production (HTTPS), gunakan Vercel proxy
    if (originalUrl.startsWith('http://') && window.location.protocol === 'https:') {
        // Extract camera name dari URL
        const urlParts = originalUrl.split('/');
        const fileName = urlParts[urlParts.length - 1]; // e.g., "SERAYA_ATAS_1.m3u8"
        const cameraName = fileName.replace('.m3u8', ''); // e.g., "SERAYA_ATAS_1"

        // Gunakan Vercel Edge Function proxy
        const proxyUrl = `/api/stream/${cameraName}`;
        console.log(`Using Vercel proxy: ${proxyUrl} for original: ${originalUrl}`);
        return proxyUrl;
    }

    // Default return original URL (untuk development)
    return originalUrl;
};// Utility untuk check apakah URL accessible
export const checkStreamAvailability = async (url: string): Promise<boolean> => {
    try {
        await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors' // Untuk bypass CORS sementara
        });
        return true;
    } catch (error) {
        console.warn(`Stream URL tidak accessible: ${url}`, error);
        return false;
    }
};

// Fallback stream URLs untuk testing
export const getFallbackStreamUrl = (): string => {
    // URL demo stream yang support HTTPS
    return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
};
