import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CameraDetailPage from './pages/CameraDetailPage';
import ControlCenter from './components/ControlCenter';
import ErrorPage from './pages/ErrorPage';
import AdminCamerasPage from './pages/admin/AdminCamerasPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <ErrorPage />
    },
    {
        path: '/camera/:id',
        element: <CameraDetailPage />,
        errorElement: <ErrorPage />
    },
    {
        path: '/dashboard',
        element: <ControlCenter />,
        errorElement: <ErrorPage />
    },
    {
        path: '/control-center',
        element: <ControlCenter />,
        errorElement: <ErrorPage />
    },
    {
        path: '/admin',
        element: <AdminDashboardPage />,
        errorElement: <ErrorPage />
    },
    {
        path: '/admin/cameras',
        element: <AdminCamerasPage />,
        errorElement: <ErrorPage />
    }
]);

export default router;
