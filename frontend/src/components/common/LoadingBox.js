import React from 'react';

function LoadingBox({ message }) {
    return (
        <div className="loading-box">
            <div className="loading-box__border"></div>
            <p>{message}</p>
        </div>
    );
}

export default LoadingBox; 