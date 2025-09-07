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
        }, 5000); // 3 detik

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

        // Cek apakah browser mendukung HLS secara native (seperti Safari iOS)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari iOS mendukung HLS secara native
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

            // Enhanced config dengan conditional settings berdasarkan URL type
            const isHttpsStream = secureUrl.startsWith('https://') && !secureUrl.includes('/api/stream/');

            const hls = new Hls({
                debug: !isHttpsStream, // Disable debug untuk HTTPS streams saja (performance)
                enableWorker: true,
                lowLatencyMode: false, // Disable untuk stability

                // Buffer settings - lebih konservatif untuk HTTPS streams
                maxBufferLength: isHttpsStream ? 15 : 30,
                maxMaxBufferLength: isHttpsStream ? 30 : 60,
                liveSyncDurationCount: isHttpsStream ? 2 : 5,

                // Fragment loading settings - lebih aggressive untuk HTTPS
                fragLoadingTimeOut: isHttpsStream ? 10000 : 20000,
                manifestLoadingTimeOut: 10000,

                // Retry settings - lebih banyak retry untuk HTTPS
                fragLoadingMaxRetry: isHttpsStream ? 10 : 6,
                manifestLoadingMaxRetry: isHttpsStream ? 5 : 3,
                fragLoadingRetryDelay: isHttpsStream ? 300 : 1000,

                // CORS settings
                xhrSetup: function (xhr) {
                    xhr.withCredentials = false; // Disable credentials untuk CORS
                    if (isHttpsStream) {
                        xhr.timeout = 8000; // Shorter timeout untuk HTTPS
                    }
                }
            });

            hls.loadSource(secureUrl);
            hls.attachMedia(video);

            hlsRef.current = hls;

            // Enhanced event monitoring
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) {
                    video.play().catch((error) => {
                        console.log('Autoplay failed:', error);
                    });
                }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                // Handle SEI payload errors khusus untuk HTTPS streams
                if (isHttpsStream && data.details === 'fragParsingError' &&
                    data.reason?.includes('SEI payload')) {
                    return; // Ignore error ini untuk HTTPS streams
                }

                if (data.fatal) {
                    console.error('Fatal HLS error:', data.type, data.details);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            if (isHttpsStream) {
                                setTimeout(() => hls.startLoad(), 1000);
                            } else {
                                hls.startLoad();
                            }
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                } else {
                    // Handle non-fatal errors khusus HTTPS
                    if (isHttpsStream && data.details === 'bufferStalledError') {
                        try {
                            if (video.currentTime > 0) {
                                video.currentTime += 0.1;
                            }
                        } catch {
                            // Ignore micro seek failure
                        }
                    }
                }
            });

            // HTTPS stream specific monitoring
            if (isHttpsStream) {
                let httpsStallCount = 0;

                const handleHttpsStall = () => {
                    httpsStallCount++;

                    // Recovery untuk HTTPS stalls
                    if (httpsStallCount > 3) {
                        console.warn('Too many HTTPS stalls - forcing recovery');
                        try {
                            hls.recoverMediaError();
                        } catch {
                            hls.startLoad();
                        }
                        httpsStallCount = 0; // Reset counter
                    }
                };

                const handleHttpsPlaying = () => {
                    if (httpsStallCount > 0) {
                        httpsStallCount = 0; // Reset stall counter
                    }
                };

                video.addEventListener('stalled', handleHttpsStall);
                video.addEventListener('playing', handleHttpsPlaying);

                // Cleanup listeners saat component unmount
                const originalCleanup = () => {
                    video.removeEventListener('stalled', handleHttpsStall);
                    video.removeEventListener('playing', handleHttpsPlaying);
                    if (hlsRef.current) {
                        hlsRef.current.destroy();
                        hlsRef.current = null;
                    }
                };

                return originalCleanup;
            }
        } else {
            console.warn('HLS not supported');
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
