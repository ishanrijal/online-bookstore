import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';

function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [reviews, setReviews] = useState([]);
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const [bookRes, reviewsRes, authorsRes] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/books/books/${id}/`),
                    axios.get(`http://127.0.0.1:8000/api/reviews/reviews/book_reviews/?book_id=${id}`),
                    axios.get('http://127.0.0.1:8000/api/users/')
                ]);
                setBook(bookRes.data);
                setReviews(reviewsRes.data);
                setAuthors(authorsRes.data);
                setLoading(false);
            } catch (error) {
                setNotification({
                    show: true,
                    message: 'Error loading book details',
                    type: 'error'
                });
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    if (loading) return <LoadingBox message="Loading book details..." />;
    if (!book) return <div>Book not found</div>;

    return (
        <div className="book-detail">
            {notification.show && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}

            <div className="book-detail__header">
                <div className="book-detail__cover">
                    <img src={book.cover_image || '/default-book-cover.jpg'} alt={book.title} />
                </div>
                
                <div className="book-detail__info">
                    <h1>{book.title}</h1>
                    <div className="book-detail__meta">
                        <span className="isbn">ISBN: {book.isbn}</span>
                        <span className="price">${book.price}</span>
                        <span className="stock">Stock: {book.stock}</span>
                    </div>
                    
                    <div className="book-detail__authors">
                        <h3>Authors</h3>
                        <div className="authors-list">
                            {book.authors.map(authorId => {
                                const author = authors.find(a => a.id === authorId);
                                return author ? (
                                    <div key={author.id} className="author-card">
                                        <img src={author.profile_picture || '/default-avatar.jpg'} alt={author.username} />
                                        <div className="author-info">
                                            <h4>{`${author.first_name} ${author.last_name}`}</h4>
                                            <p>{author.email}</p>
                                        </div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="book-detail__content">
                <div className="book-detail__description">
                    <h2>Description</h2>
                    <p>{book.description}</p>
                </div>

                <div className="book-detail__specs">
                    <h2>Specifications</h2>
                    <table>
                        <tbody>
                            <tr><td>Language</td><td>{book.language}</td></tr>
                            <tr><td>Page Count</td><td>{book.page_count}</td></tr>
                            <tr><td>Dimensions</td><td>{book.dimensions}</td></tr>
                            <tr><td>Weight</td><td>{book.weight}g</td></tr>
                            <tr><td>Edition</td><td>{book.edition}</td></tr>
                            <tr><td>Publication Date</td><td>{new Date(book.publication_date).toLocaleDateString()}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="book-detail__reviews">
                    <h2>Reviews</h2>
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <span className="reviewer">{review.user.username}</span>
                                        <div className="rating">
                                            {'★'.repeat(review.rating)}
                                            {'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p className="review-content">{review.comment}</p>
                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews">No reviews yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookDetail; 