import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

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

        // Cek apakah browser mendukung HLS secara native (seperti Safari iOS)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari iOS mendukung HLS secara native
            console.log('Using native HLS support');
            video.src = src;

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

            hls.loadSource(src);
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
    );
};

export default VideoPlayer;
