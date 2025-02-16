import React, { useEffect, useState } from 'react';

function NotificationBox({ message, type, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000); // Increased time to 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    return (
        <div className={`notification-box ${type} ${isClosing ? 'fade-out' : ''}`}>
            <span className="message">{message}</span>
            <button 
                className="close-btn" 
                onClick={handleClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}

export default NotificationBox; 