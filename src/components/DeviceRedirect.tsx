import { Navigate } from 'react-router-dom';
import ControlCenter from '../components/ControlCenter';
import CameraDetailPage from '../pages/CameraDetailPage';

// Device detection helper
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};

// Mobile redirect: /dashboard → /camera on mobile
export const MobileRedirect = () => {
    if (isMobile()) {
        return <Navigate to="/camera" replace />;
    }
    return <ControlCenter />;
};

// Desktop redirect: /camera → /dashboard on desktop
export const DesktopRedirect = () => {
    if (!isMobile()) {
        return <Navigate to="/dashboard" replace />;
    }
    return <CameraDetailPage />;
};
