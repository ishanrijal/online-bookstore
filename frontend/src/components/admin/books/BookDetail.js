import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../../utils/axios';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import './BookDetail.css';

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            const response = await axios.get(`/books/${id}/`);
            setBook(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching book details:', error);
            setError(error.response?.data?.message || 'Failed to fetch book details');
            setLoading(false);
        }
    };

    if (loading) return <LoadingBox message="Loading book details..." />;
    if (error) return <div className="error-message">{error}</div>;
    if (!book) return <div className="error-message">Book not found</div>;

    return (
        <div className="book-detail">
            <div className="book-detail__header">
                <div className="header-left">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="back-button"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h2>{book.title}</h2>
                </div>
                <Link 
                    to={`/admin/manage-books/edit/${book.id}`}
                    className="edit-button"
                >
                    <FaEdit /> Edit Book
                </Link>
            </div>

            <div className="book-detail__content">
                <div className="book-detail__image">
                    {book.cover_image && (
                        <img 
                            src={book.cover_image} 
                            alt={book.title} 
                            className="cover-image"
                        />
                    )}
                </div>

                <div className="book-detail__info">
                    <div className="info-grid">
                        <div className="info-item full-width">
                            <h3>Description</h3>
                            <p className="book-description">{book.description}</p>
                        </div>
                        <div className="info-item">
                            <h3>Basic Information</h3>
                            <p><strong>ISBN:</strong> {book.isbn}</p>
                            <p><strong>Price:</strong> Rs.{book.price}</p>
                            <p><strong>Stock:</strong> {book.stock}</p>
                            <p><strong>Language:</strong> {book.language}</p>
                            <p><strong>Featured:</strong> {book.featured ? 'Yes' : 'No'}</p>
                        </div>

                        <div className="info-item">
                            <h3>Categories</h3>
                            <div className="categories-list">
                                {book.categories_details?.map((cat, index) => (
                                    <Link 
                                        key={cat.id}
                                        to={`/admin/categories/${cat.slug}`}
                                        className="category-link"
                                    >
                                        {cat.name}
                                        {index < book.categories_details.length - 1 && ', '}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="info-item">
                            <h3>Publication Details</h3>
                            <p><strong>Publication Date:</strong> {book.publication_date}</p>
                            <p><strong>Edition:</strong> {book.edition}</p>
                            <p><strong>Page Count:</strong> {book.page_count}</p>
                            <p><strong>Dimensions:</strong> {book.dimensions}</p>
                            <p><strong>Weight:</strong> {book.weight}</p>
                        </div>

                        <div className="info-item">
                            <h3>Publisher Information</h3>
                            <p><strong>Publisher:</strong> {book.publisher_details?.name}</p>
                        </div>

                        <div className="info-item">
                            <h3>Statistics</h3>
                            <p><strong>Average Rating:</strong> {book.average_rating || 'No ratings'}</p>
                            <p><strong>Total Reviews:</strong> {book.total_reviews}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookDetail; 