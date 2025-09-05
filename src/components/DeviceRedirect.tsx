import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ControlCenter from '../components/ControlCenter';
import CameraDetailPage from '../pages/CameraDetailPage';

// Device detection helper
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};

// Hook untuk detect screen size changes
const useDeviceDetection = () => {
    const [isMobileDevice, setIsMobileDevice] = useState(isMobile());

    useEffect(() => {
        const handleResize = () => {
            setIsMobileDevice(isMobile());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobileDevice;
};

// Mobile redirect: /dashboard → /camera on mobile (dengan responsive detection)
export const MobileRedirect = () => {
    const isMobileDevice = useDeviceDetection();

    if (isMobileDevice) {
        return <Navigate to="/camera" replace />;
    }
    return <ControlCenter />;
};

// Desktop redirect: /camera → /dashboard on desktop (dengan responsive detection) 
export const DesktopRedirect = () => {
    const isMobileDevice = useDeviceDetection();

    if (!isMobileDevice) {
        return <Navigate to="/dashboard" replace />;
    }
    return <CameraDetailPage />;
};
