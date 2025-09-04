// Define the types used throughout the application

export interface Camera {
    id: string;
    name: string;
    streamUrl: string;
    thumbnail?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}
