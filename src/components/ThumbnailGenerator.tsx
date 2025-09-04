import React from 'react';

interface ThumbnailGeneratorProps {
    cameraName: string;
    className?: string;
}

/**
 * Komponen ini menghasilkan thumbnail placeholder untuk kamera
 * saat gambar thumbnail tidak tersedia
 */
const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({
    cameraName,
    className = ''
}) => {
    // Membuat warna background berdasarkan nama kamera (konsisten untuk setiap kamera)
    const getColorFromString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 60%, 30%)`;
    };

    const bgColor = getColorFromString(cameraName);

    return (
        <div
            className={`flex flex-col items-center justify-center w-full h-full ${className}`}
            style={{ backgroundColor: bgColor }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>

            <div className="text-center px-4">
                <p className="text-white font-medium truncate max-w-full">{cameraName}</p>
            </div>
        </div>
    );
};

export default ThumbnailGenerator;
