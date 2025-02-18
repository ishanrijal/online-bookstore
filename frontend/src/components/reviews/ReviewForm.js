import React, { useState } from 'react';
import StarRating from './StarRating';
import '../../sass/components/_reviews.sass';

const ReviewForm = ({ onSubmit, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters long');
            return;
        }

        onSubmit({ rating, comment });
    };

    return (
        <div className="review-form">
            <h4>Write Your Review</h4>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="rating-field">
                    <label>Rating:</label>
                    <StarRating rating={rating} onChange={setRating} />
                </div>

                <div className="comment-field">
                    <label>Your Review:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this book..."
                        rows={4}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        Submit Review
                    </button>
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm; 