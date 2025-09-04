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

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Bersihkan HLS instance sebelumnya jika ada
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Cek apakah browser mendukung HLS secara native (seperti Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Jika mendukung, gunakan cara biasa
            video.src = src;
        } else if (Hls.isSupported()) {
            // Jika browser tidak mendukung HLS secara native, gunakan HLS.js
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) {
                    video.play().catch(error => {
                        console.error('Error playing video:', error);
                    });
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Unrecoverable error');
                            hls.destroy();
                            break;
                    }
                }
            });
        } else {
            console.error('Browser tidak mendukung HLS');
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
        />
    );
};

export default VideoPlayer;
