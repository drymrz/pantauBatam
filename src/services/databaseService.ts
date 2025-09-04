import { v4 as uuidv4 } from 'uuid';
import type { Camera, ApiResponse } from '../types';
import {
    dbConfig,
    GET_ALL_CAMERAS,
    GET_CAMERA_BY_ID,
    ADD_CAMERA,
    UPDATE_CAMERA,
    DELETE_CAMERA,
    CREATE_CAMERAS_TABLE
} from '../config/db';
import mysql from 'mysql2/promise';

// Untuk saat ini, kita akan menggunakan data dummy jika koneksi database gagal
export class DatabaseService {
    // Data dummy untuk fallback
    private static dummyCameras: Camera[] = [
        {
            id: '1',
            name: 'Seraya Atas 1',
            location: 'Seraya Atas',
            streamUrl: 'http://103.248.199.102/camera/SERAYA_ATAS_1.m3u8',
            thumbnail: '/thumbnails/seraya-atas-1.jpg',
            description: 'Kamera pemantau lalu lintas di daerah Seraya Atas',
            isActive: true
        },
        {
            id: '2',
            name: 'Nagoya Hill',
            location: 'Nagoya',
            streamUrl: 'http://103.248.199.102/camera/NAGOYA_HILL.m3u8',
            thumbnail: '/thumbnails/nagoya-hill.jpg',
            description: 'Kamera pemantau area Nagoya Hill Shopping Mall',
            isActive: true
        }
    ];

    // Flag untuk menentukan apakah menggunakan MySQL atau data dummy
    private static useMySQL = false;

    // Fungsi untuk mendapatkan semua kamera
    static async getAllCameras(): Promise<ApiResponse<Camera[]>> {
        try {
            if (this.useMySQL) {
                const connection = await this.connect();

                try {
                    // Create table if not exists
                    await connection.execute(CREATE_CAMERAS_TABLE);

                    const [rows] = await connection.execute(GET_ALL_CAMERAS);
                    await connection.end();

                    return {
                        success: true,
                        data: rows as Camera[]
                    };
                } catch (error) {
                    console.error('Error executing query:', error);
                    await connection.end();
                    throw error;
                }
            } else {
                // Gunakan data dummy
                return {
                    success: true,
                    data: this.dummyCameras
                };
            }
        } catch (error) {
            console.error('Error fetching cameras:', error);
            // Fallback ke data dummy jika koneksi gagal
            return {
                success: true,
                data: this.dummyCameras,
                message: 'Using fallback data: ' + (error instanceof Error ? error.message : 'Unknown database error')
            };
        }
    }

    // Fungsi untuk mendapatkan kamera berdasarkan ID
    static async getCameraById(id: string): Promise<ApiResponse<Camera | null>> {
        try {
            if (this.useMySQL) {
                const connection = await this.connect();

                try {
                    const [rows]: any = await connection.execute(GET_CAMERA_BY_ID, [id]);
                    await connection.end();

                    const camera = rows.length > 0 ? rows[0] as Camera : null;
                    return {
                        success: true,
                        data: camera
                    };
                } catch (error) {
                    console.error(`Error fetching camera with ID ${id}:`, error);
                    await connection.end();
                    throw error;
                }
            } else {
                // Gunakan data dummy
                const camera = this.dummyCameras.find(camera => camera.id === id) || null;
                return {
                    success: true,
                    data: camera
                };
            }
        } catch (error) {
            console.error(`Error fetching camera with ID ${id}:`, error);
            // Fallback ke data dummy jika koneksi gagal
            const camera = this.dummyCameras.find(camera => camera.id === id) || null;
            return {
                success: true,
                data: camera,
                message: 'Using fallback data: ' + (error instanceof Error ? error.message : 'Unknown database error')
            };
        }
    }

    // Fungsi untuk menambahkan kamera baru
    static async addCamera(camera: Omit<Camera, 'id'>): Promise<ApiResponse<Camera>> {
        try {
            if (this.useMySQL) {
                const connection = await this.connect();

                try {
                    const id = uuidv4();
                    const { name, streamUrl, thumbnail, location, description, isActive } = camera;

                    await connection.execute(ADD_CAMERA, [
                        id, name, streamUrl, thumbnail || null, location || null,
                        description || null, isActive === undefined ? true : isActive
                    ]);

                    await connection.end();

                    const newCamera: Camera = {
                        id,
                        name,
                        streamUrl,
                        thumbnail,
                        location,
                        description,
                        isActive: isActive === undefined ? true : isActive
                    };

                    return {
                        success: true,
                        data: newCamera,
                        message: 'Camera added successfully'
                    };
                } catch (error) {
                    console.error('Error adding camera:', error);
                    await connection.end();
                    throw error;
                }
            } else {
                // Mode dummy
                const id = uuidv4();
                const newCamera: Camera = {
                    id,
                    ...camera,
                    isActive: camera.isActive === undefined ? true : camera.isActive
                };

                this.dummyCameras.push(newCamera);

                return {
                    success: true,
                    data: newCamera,
                    message: 'Camera added successfully (dummy mode)'
                };
            }
        } catch (error) {
            console.error('Error adding camera:', error);
            return {
                success: false,
                data: {} as Camera,
                message: 'Failed to add camera: ' + (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }

    // Fungsi untuk mengupdate kamera
    static async updateCamera(id: string, camera: Partial<Camera>): Promise<ApiResponse<Camera>> {
        try {
            if (this.useMySQL) {
                const connection = await this.connect();

                try {
                    // Get current camera data first
                    const [rows]: any = await connection.execute(GET_CAMERA_BY_ID, [id]);

                    if (rows.length === 0) {
                        await connection.end();
                        return {
                            success: false,
                            data: {} as Camera,
                            message: `Camera with ID ${id} not found`
                        };
                    }

                    const currentCamera = rows[0] as Camera;

                    // Merge with updates
                    const updatedCamera: Camera = {
                        ...currentCamera,
                        ...camera,
                        id // Ensure ID remains the same
                    };

                    await connection.execute(UPDATE_CAMERA, [
                        updatedCamera.name,
                        updatedCamera.streamUrl,
                        updatedCamera.thumbnail || null,
                        updatedCamera.location || null,
                        updatedCamera.description || null,
                        updatedCamera.isActive === undefined ? true : updatedCamera.isActive,
                        id
                    ]);

                    await connection.end();

                    return {
                        success: true,
                        data: updatedCamera,
                        message: 'Camera updated successfully'
                    };
                } catch (error) {
                    console.error(`Error updating camera with ID ${id}:`, error);
                    await connection.end();
                    throw error;
                }
            } else {
                // Mode dummy
                const index = this.dummyCameras.findIndex(c => c.id === id);

                if (index === -1) {
                    return {
                        success: false,
                        data: {} as Camera,
                        message: `Camera with ID ${id} not found`
                    };
                }

                const updatedCamera: Camera = {
                    ...this.dummyCameras[index],
                    ...camera,
                    id // Ensure ID remains the same
                };

                this.dummyCameras[index] = updatedCamera;

                return {
                    success: true,
                    data: updatedCamera,
                    message: 'Camera updated successfully (dummy mode)'
                };
            }
        } catch (error) {
            console.error(`Error updating camera with ID ${id}:`, error);
            return {
                success: false,
                data: {} as Camera,
                message: 'Failed to update camera: ' + (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }

    // Fungsi untuk menghapus kamera
    static async deleteCamera(id: string): Promise<ApiResponse<boolean>> {
        try {
            if (this.useMySQL) {
                const connection = await this.connect();

                try {
                    const [result]: any = await connection.execute(DELETE_CAMERA, [id]);
                    await connection.end();

                    if (result.affectedRows === 0) {
                        return {
                            success: false,
                            data: false,
                            message: `Camera with ID ${id} not found`
                        };
                    }

                    return {
                        success: true,
                        data: true,
                        message: 'Camera deleted successfully'
                    };
                } catch (error) {
                    console.error(`Error deleting camera with ID ${id}:`, error);
                    await connection.end();
                    throw error;
                }
            } else {
                // Mode dummy
                const initialLength = this.dummyCameras.length;
                this.dummyCameras = this.dummyCameras.filter(c => c.id !== id);

                if (this.dummyCameras.length === initialLength) {
                    return {
                        success: false,
                        data: false,
                        message: `Camera with ID ${id} not found`
                    };
                }

                return {
                    success: true,
                    data: true,
                    message: 'Camera deleted successfully (dummy mode)'
                };
            }
        } catch (error) {
            console.error(`Error deleting camera with ID ${id}:`, error);
            return {
                success: false,
                data: false,
                message: 'Failed to delete camera: ' + (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }

    // Fungsi untuk terhubung ke MySQL
    static async connect() {
        try {
            const connection = await mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
                port: dbConfig.port
            });

            return connection;
        } catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
}
