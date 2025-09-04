import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import AdminPage from './pages/AdminPage';
import { MobileRedirect, DesktopRedirect } from './components/DeviceRedirect';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <ErrorPage />
    },
    {
        path: '/camera',
        element: <DesktopRedirect />,
        errorElement: <ErrorPage />
    },
    {
        path: '/dashboard',
        element: <MobileRedirect />,
        errorElement: <ErrorPage />
    },
    {
        path: '/apaantuh',
        element: <AdminPage />,
        errorElement: <ErrorPage />
    }
]);

export default router;
