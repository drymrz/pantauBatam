// Utility untuk mengatasi mixed content issues
export const getSecureStreamUrl = (originalUrl: string): string => {
    // Jika sudah HTTPS, return as is
    if (originalUrl.startsWith('https://')) {
        return originalUrl;
    }

    // Jika HTTP dan sedang di production (HTTPS), gunakan proxy
    if (originalUrl.startsWith('http://') && window.location.protocol === 'https:') {
        // Opsi 1: Coba ganti ke HTTPS
        const httpsUrl = originalUrl.replace('http://', 'https://');
        return httpsUrl;

        // Opsi 2: Jika HTTPS tidak work, bisa gunakan proxy service
        // const encodedUrl = encodeURIComponent(originalUrl);
        // return `https://cors-anywhere.herokuapp.com/${originalUrl}`;
        // atau
        // return `https://api.allorigins.win/raw?url=${encodedUrl}`;
    }

    // Default return original URL
    return originalUrl;
};

// Utility untuk check apakah URL accessible
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
