import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import LoadingBox from '../common/LoadingBox';
import NotificationBox from '../common/NotificationBox';
import '../../sass/components/_reviews.sass';

const ReviewList = ({ bookId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [bookId]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/reviews/reviews/book_reviews/?book_id=${bookId}`);
            setReviews(response.data);
            setLoading(false);
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to load reviews'
            });
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            await axios.post('/reviews/reviews/', {
                book: bookId,
                ...reviewData
            });
            
            setNotification({
                type: 'success',
                message: 'Review submitted successfully!'
            });
            
            setShowReviewForm(false);
            fetchReviews(); // Refresh reviews
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to submit review'
            });
        }
    };

    if (loading) return <LoadingBox message="Loading reviews..." />;

    return (
        <div className="reviews-section">
            {notification.message && (
                <NotificationBox
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <div className="reviews-header">
                <h3>Customer Reviews</h3>
                <button 
                    className="write-review-btn"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                >
                    Write a Review
                </button>
            </div>

            {showReviewForm && (
                <ReviewForm 
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                />
            )}

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <span className="reviewer-name">{review.user_name}</span>
                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} readonly />
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-reviews">No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
};

export default ReviewList; 