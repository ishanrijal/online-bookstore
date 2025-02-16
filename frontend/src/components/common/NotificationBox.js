import React, { useEffect } from 'react';

function NotificationBox({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification-box notification-box--${type}`}>
            <div className="notification-box__border"></div>
            <p>{message}</p>
            <button onClick={onClose} className="notification-box__close">×</button>
        </div>
    );
}

export default NotificationBox; 