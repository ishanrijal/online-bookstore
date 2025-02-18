import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import LoadingBox from '../common/LoadingBox';
import NotificationBox from '../common/NotificationBox';
import LoaderModal from '../common/LoaderModal';
import '../../sass/components/_reviews.sass';

const ReviewList = ({ bookId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editForm, setEditForm] = useState({
        rating: 0,
        comment: ''
    });
    const [filters, setFilters] = useState({
        rating: '',
        dateRange: ''
    });

    useEffect(() => {
        fetchReviews();
    }, [bookId]);

    const fetchReviews = async () => {
        try {
            let url = `/reviews/reviews/book_reviews/?book_id=${bookId}`;
            const params = new URLSearchParams();

            if (filters.rating) {
                params.append('rating__exact', filters.rating);
            }

            if (filters.dateRange) {
                const now = new Date();
                let startDate;

                switch (filters.dateRange) {
                    case 'today':
                        startDate = new Date();
                        startDate.setHours(0, 0, 0, 0);
                        params.append('created_at__gte', startDate.toISOString());
                        params.append('created_at__lt', new Date().toISOString());
                        break;
                    case 'week':
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - 7);
                        params.append('created_at__gte', startDate.toISOString());
                        params.append('created_at__lt', new Date().toISOString());
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        params.append('created_at__gte', startDate.toISOString());
                        params.append('created_at__lt', new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString());
                        break;
                    case 'year':
                        startDate = new Date(now.getFullYear(), 0, 1);
                        params.append('created_at__gte', startDate.toISOString());
                        params.append('created_at__lt', new Date(now.getFullYear() + 1, 0, 0).toISOString());
                        break;
                }
            }

            const queryString = params.toString();
            const response = await axios.get(`${url}${queryString ? `&${queryString}` : ''}`);
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
        setSubmitting(true);
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
            let errorMessage = 'Failed to submit review';
            
            // Handle duplicate review error
            if (error.response?.status === 500 && 
                error.response?.data?.includes('Duplicate entry')) {
                errorMessage = 'You have already reviewed this book';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setNotification({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setSubmitting(false);
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
        setSubmitting(true);
        try {
            await axios.patch(`/reviews/reviews/${reviewId}/`, editForm);
            setNotification({
                type: 'success',
                message: 'Review updated successfully'
            });
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update review'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        setSubmitting(true);
        try {
            await axios.delete(`/reviews/reviews/${reviewId}/`);
            setNotification({
                type: 'success',
                message: 'Review deleted successfully'
            });
            fetchReviews();
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to delete review'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingBox message="Loading reviews..." />;

    return (
        <div className="reviews-section">
            {submitting && <LoaderModal message="Processing..." />}
            
            {notification.message && (
                <NotificationBox
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <div className="reviews-header">
                <h3>Customer Reviews</h3>
                <div className="filters">
                    <div className="filter-group">
                        <label>Filter by Rating:</label>
                        <select 
                            value={filters.rating}
                            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                        >
                            <option value="">All Ratings</option>
                            <option value="1">1 Star</option>
                            <option value="2">2 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Filter by Date:</label>
                        <select 
                            value={filters.dateRange}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        >
                            <option value="">Any Date</option>
                            <option value="today">Today</option>
                            <option value="week">Past 7 days</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
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
                                    <div className="reviewer-avatar">
                                        {review.user_profile_picture ? (
                                            <img src={review.user_profile_picture} alt={review.user_name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {review.user_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="reviewer-details">
                                        <div className="reviewer-name-role">
                                            <span className="reviewer-name">{review.user_name}</span>
                                            {review.user_role && (
                                                <span className={`reviewer-role ${review.user_role.toLowerCase()}`}>
                                                    {review.user_role === 'ADMIN' ? 'Admin' : 'Customer'}
                                                </span>
                                            )}
                                        </div>
                                        <span className="review-date">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {editingReview === review.id ? (
                                    <StarRating 
                                        rating={editForm.rating} 
                                        onChange={(rating) => setEditForm(prev => ({ ...prev, rating }))}
                                    />
                                ) : (
                                    <StarRating rating={review.rating} readonly />
                                )}
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
                                            className="update-btn small"
                                            onClick={() => handleUpdateReview(review.id)}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="cancel-btn small"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="review-comment">{review.comment}</p>
                                    {user && user.id === review.user && (
                                        <div className="review-actions">
                                            <button 
                                                className="edit-btn small"
                                                onClick={() => handleEditClick(review)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="delete-btn small"
                                                onClick={() => handleDeleteReview(review.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
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