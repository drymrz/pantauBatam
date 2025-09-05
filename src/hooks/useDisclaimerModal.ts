import { useState, useEffect } from 'react';

export const useDisclaimerModal = () => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check apakah modal sudah di-dismiss hari ini
        const dismissedDate = localStorage.getItem('pantauBatam_disclaimerDismissed');
        const today = new Date().toDateString(); // Format: "Mon Dec 25 2023"

        if (!dismissedDate || dismissedDate !== today) {
            // Belum di-dismiss hari ini atau belum pernah di-dismiss
            // Tampilkan modal setelah delay 500ms
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, []);

    const closeModal = () => {
        setShowModal(false);
    };

    return {
        showModal,
        closeModal
    };
};
