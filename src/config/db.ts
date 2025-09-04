// Database configuration 
// These are now only used for reference, actual DB connection happens on the server
export const dbConfig = {
    host: '137.184.250.80',
    user: 'root',
    password: 'NearBatam@2025a',
    database: 'cctvPantauBatam',
    port: 3306
};

// Contoh query SQL untuk membuat tabel
export const CREATE_CAMERAS_TABLE = `
  CREATE TABLE IF NOT EXISTS cameras (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    streamUrl TEXT NOT NULL,
    thumbnail TEXT,
    location VARCHAR(100),
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Query untuk mendapatkan semua kamera
export const GET_ALL_CAMERAS = `SELECT id, name, streamUrl, thumbnail, location, description, isActive FROM cameras`;

// Query untuk mendapatkan kamera berdasarkan ID
export const GET_CAMERA_BY_ID = `SELECT id, name, streamUrl, thumbnail, location, description, isActive FROM cameras WHERE id = ?`;

// Query untuk menambahkan kamera baru
export const ADD_CAMERA = `
  INSERT INTO cameras (id, name, streamUrl, thumbnail, location, description, isActive) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// Query untuk mengupdate kamera
export const UPDATE_CAMERA = `
  UPDATE cameras 
  SET name = ?, streamUrl = ?, thumbnail = ?, location = ?, description = ?, isActive = ? 
  WHERE id = ?
`;

// Query untuk menghapus kamera
export const DELETE_CAMERA = `DELETE FROM cameras WHERE id = ?`;
