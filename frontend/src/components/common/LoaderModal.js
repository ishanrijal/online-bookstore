import React from 'react';
import '../../sass/components/_loader-modal.sass';

const LoaderModal = ({ message = "Processing..." }) => {
    return (
        <div className="loader-modal">
            <div className="loader-modal__content">
                <div className="loader-modal__spinner"></div>
                <p className="loader-modal__message">{message}</p>
            </div>
        </div>
    );
};

export default LoaderModal; 