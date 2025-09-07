import { useState } from 'react';

interface DisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
    const [dontShowToday, setDontShowToday] = useState(false);

    if (!isOpen) return null;

    const handleContinue = () => {
        if (dontShowToday) {
            // Simpan ke localStorage dengan timestamp hari ini
            const today = new Date();
            const todayString = today.toDateString(); // Format: "Mon Dec 25 2023"
            localStorage.setItem('pantauBatam_disclaimerDismissed', todayString);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white/20 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-lg">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Informasi Penting</h2>
                    </div>

                    {/* Content */}
                    <div className="mb-6 text-white leading-relaxed">
                        <p className="mb-4">
                            <strong>PantauBatam</strong> adalah website yang bertujuan untuk membantu masyarakat Batam melihat kondisi real-time daerah mereka melalui kamera CCTV yang sudah tersedia untuk umum.
                        </p>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-800 mb-1">Disclaimer:</p>
                                    <ul className="text-yellow-700 space-y-1">
                                        <li>• CCTV yang ditampilkan adalah milik dan tanggung jawab pihak pemerintah</li>
                                        <li>• Website ini tidak memiliki kendali atas kualitas atau ketersediaan stream</li>
                                        <li>• Gunakan informasi ini dengan bijak dan bertanggung jawab</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-white">
                            Dengan melanjutkan, Anda memahami dan menyetujui bahwa penggunaan website ini sepenuhnya menjadi tanggung jawab Anda.
                        </p>
                    </div>

                    {/* Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={dontShowToday}
                                onChange={(e) => setDontShowToday(e.target.checked)}
                                className="w-4 h-4 text-white bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-2 text-sm text-white">
                                Jangan tampilkan lagi untuk hari ini
                            </span>
                        </label>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleContinue}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Oke, Aku Paham
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerModal;
