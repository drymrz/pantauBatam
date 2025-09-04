// Ini adalah template untuk konfigurasi database
// Nanti kredensial yang sebenarnya dapat ditambahkan

export const dbConfig = {
    host: import.meta.env.VITE_DB_HOST || 'localhost',
    user: import.meta.env.VITE_DB_USER || 'root',
    password: import.meta.env.VITE_DB_PASSWORD || '',
    database: import.meta.env.VITE_DB_NAME || 'pantau_batam',
    port: parseInt(import.meta.env.VITE_DB_PORT || '3306', 10)
};

// Untuk pengembangan, kita bisa menggunakan file .env untuk menyimpan kredensial
// Contoh isi file .env:
/*
DB_HOST=localhost
DB_USER=pantau_batam_user
DB_PASSWORD=your_password
DB_NAME=pantau_batam
DB_PORT=3306
*/
