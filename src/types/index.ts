export interface Camera {
    id: string;
    name: string;
    streamUrl: string;
    thumbnail?: string;
    location?: string;
    description?: string;
    isActive?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
