import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { getSecureStreamUrl } from '../utils/streamUtils';

interface VideoPlayerProps {
    src: string;
    autoPlay?: boolean;
    muted?: boolean;
    controls?: boolean;
    className?: string;
}

const VideoPlayer = ({
    src,
    autoPlay = true,
    muted = true,
    controls = true,
    className = ''
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [showLoader, setShowLoader] = useState(true);

    // Dummy loader 3 detik
    useEffect(() => {
        setShowLoader(true);
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 3000); // 3 detik

        return () => clearTimeout(timer);
    }, [src]); // Reset loader setiap kali src berubah

    // Initialize video player
    useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        // Bersihkan HLS instance sebelumnya jika ada
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Reset video src
        video.src = '';

        // Get secure URL untuk production
        const secureUrl = getSecureStreamUrl(src);
        console.log('Original URL:', src);
        console.log('Secure URL:', secureUrl);

        // Cek apakah browser mendukung HLS secara native (seperti Safari iOS)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari iOS mendukung HLS secara native
            console.log('Using native HLS support');
            video.src = secureUrl;

            if (autoPlay) {
                // Tambah delay untuk iOS
                setTimeout(() => {
                    video.play().catch((error) => {
                        console.log('Autoplay failed:', error);
                    });
                }, 100);
            }
        } else if (Hls.isSupported()) {
            // Browser lain menggunakan HLS.js
            console.log('Using HLS.js');
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                debug: false,
                // Tambah konfigurasi untuk mobile
                maxBufferLength: 10,
                maxMaxBufferLength: 20,
                liveSyncDurationCount: 3,
            });

            hls.loadSource(secureUrl);
            hls.attachMedia(video);

            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest parsed');
                if (autoPlay) {
                    video.play().catch((error) => {
                        console.log('Autoplay failed:', error);
                    });
                }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                console.log('HLS Error:', data);
            });
        } else {
            console.log('HLS not supported');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src, autoPlay]);

    return (
        <div className="relative h-full">
            <video
                ref={videoRef}
                className={`${className}`}
                controls={controls}
                autoPlay={autoPlay}
                muted={muted}
                playsInline
                webkit-playsinline="true"
                preload="metadata"
                crossOrigin="anonymous"
            />

            {/* Loader Overlay */}
            {showLoader && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-3"></div>
                        <p className="text-white text-sm">Loading Stream...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
