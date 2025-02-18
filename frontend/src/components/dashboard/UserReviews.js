import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import StarRating from '../reviews/StarRating';
import LoadingBox from '../common/LoadingBox';
import NotificationBox from '../common/NotificationBox';
import '../../sass/components/_user-reviews.sass';

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [editingReview, setEditingReview] = useState(null);
    const [editForm, setEditForm] = useState({
        rating: 0,
        comment: ''
    });

    useEffect(() => {
        fetchUserReviews();
    }, []);

    const fetchUserReviews = async () => {
        try {
            const response = await axios.get('/reviews/reviews/');
            setReviews(response.data);
            setLoading(false);
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to load your reviews'
            });
            setLoading(false);
        }
    };

    const handleEditClick = (review) => {
        setEditingReview(review.id);
        setEditForm({
            rating: review.rating,
            comment: review.comment
        });
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setEditForm({ rating: 0, comment: '' });
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            await axios.patch(`/reviews/reviews/${reviewId}/`, editForm);
            setNotification({
                type: 'success',
                message: 'Review updated successfully'
            });
            setEditingReview(null);
            fetchUserReviews();
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update review'
            });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            await axios.delete(`/reviews/reviews/${reviewId}/`);
            setNotification({
                type: 'success',
                message: 'Review deleted successfully'
            });
            fetchUserReviews();
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to delete review'
            });
        }
    };

    if (loading) return <LoadingBox message="Loading your reviews..." />;

    return (
        <div className="user-reviews">
            <div className="user-reviews__header">
                <h2>My Reviews</h2>
            </div>

            {notification.message && (
                <NotificationBox
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <div className="user-reviews__list">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-book-info">
                                <img 
                                    src={review.book_cover} 
                                    alt={review.book_title} 
                                    className="book-cover"
                                />
                                <div className="book-details">
                                    <h3>{review.book_title}</h3>
                                    {editingReview === review.id ? (
                                        <StarRating 
                                            rating={editForm.rating} 
                                            onChange={(rating) => setEditForm(prev => ({ ...prev, rating }))}
                                        />
                                    ) : (
                                        <StarRating rating={review.rating} readonly />
                                    )}
                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            {editingReview === review.id ? (
                                <div className="edit-form">
                                    <textarea
                                        value={editForm.comment}
                                        onChange={(e) => setEditForm(prev => ({ 
                                            ...prev, 
                                            comment: e.target.value 
                                        }))}
                                        className="edit-textarea"
                                        rows={4}
                                    />
                                    <div className="edit-actions">
                                        <button 
                                            className="update-btn"
                                            onClick={() => handleUpdateReview(review.id)}
                                        >
                                            Update Review
                                        </button>
                                        <button 
                                            className="cancel-btn"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="review-comment">{review.comment}</p>
                                    <div className="review-actions">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEditClick(review)}
                                        >
                                            Edit Review
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            Delete Review
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-reviews">
                        <p>You haven't written any reviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReviews; 