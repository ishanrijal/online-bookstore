import React, { useState } from 'react';
import '../../sass/components/_reviews.sass';

const StarRating = ({ rating, onChange, readonly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                
                return (
                    <span
                        key={index}
                        className={`star ${ratingValue <= (hover || rating) ? 'filled' : ''}`}
                        onClick={() => !readonly && onChange(ratingValue)}
                        onMouseEnter={() => !readonly && setHover(ratingValue)}
                        onMouseLeave={() => !readonly && setHover(0)}
                        style={{ cursor: readonly ? 'default' : 'pointer' }}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating; 