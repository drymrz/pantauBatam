import { Link, useRouteError } from 'react-router-dom';

interface RouterError {
    statusText?: string;
    message?: string;
}

const ErrorPage = () => {
    const error = useRouteError() as RouterError;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-4">Oops!</h1>
                <p className="text-xl text-gray-400 mb-6">Halaman tidak ditemukan</p>
                <p className="text-gray-500 mb-8">
                    {error?.statusText || error?.message || 'Maaf, halaman yang Anda cari tidak ditemukan.'}
                </p>
                <Link
                    to="/"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg inline-block transition-colors"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
