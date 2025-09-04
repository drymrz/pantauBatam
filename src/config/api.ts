// Konfigurasi API untuk mengakses backend
const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 10000, // 10 detik
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
        CAMERAS: '/cameras',
        CAMERA_BY_ID: (id: number) => `/cameras/${id}`,
        AUTH: '/auth',
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
    }
};

export default API_CONFIG;
