export interface Camera {
    id: string;
    name: string;
    streamUrl: string;
    thumbnail?: string;
    isActive: boolean;
    realtime: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}
