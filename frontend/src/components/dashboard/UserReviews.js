import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import StarRating from '../reviews/StarRating';
import LoadingBox from '../common/LoadingBox';
import NotificationBox from '../common/NotificationBox';
import LoaderModal from '../common/LoaderModal';
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
    const [filters, setFilters] = useState({
        rating: '',
        dateRange: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUserReviews();
    }, [filters]);

    const fetchUserReviews = async () => {
        try {
            let url = '/reviews/reviews/';
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
            const response = await axios.get(`${url}${queryString ? `?${queryString}` : ''}`);
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
        setSubmitting(true);
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
            fetchUserReviews();
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to delete review'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    if (loading) return <LoadingBox message="Loading your reviews..." />;

    return (
        <div className="user-reviews">
            {submitting && <LoaderModal message="Processing..." />}
            
            <div className="user-reviews__header">
                <h2>My Reviews</h2>
                <div className="filters">
                    <div className="filter-group">
                        <label>Filter by Rating:</label>
                        <select 
                            value={filters.rating}
                            onChange={(e) => handleFilterChange('rating', e.target.value)}
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
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        >
                            <option value="">Any Date</option>
                            <option value="today">Today</option>
                            <option value="week">Past 7 days</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
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