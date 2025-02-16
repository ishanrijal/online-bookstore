import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import '../sass/components/_bookDetail.sass';

const BookDetail = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/books/${id}/`);
                setBook(response.data);
                setLoading(false);
            } catch (error) {
                setNotification({
                    type: 'error',
                    message: 'Failed to load book details'
                });
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setNotification({
                    type: 'error',
                    message: 'Please login to add items to cart'
                });
                return;
            }

            await axios.post(
                'http://127.0.0.1:8000/api/orders/cart/add/',
                { book_id: id, quantity: 1 },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setNotification({
                type: 'success',
                message: 'Book added to cart successfully!'
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to add book to cart'
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!book) return null;

    return (
        <>
            <Header />
            <main className="book-detail">
                {notification.message && (
                    <div className={`notification-box notification-box--${notification.type}`}>
                        <span>{notification.message}</span>
                        <button 
                            className="notification-box__close"
                            onClick={() => setNotification({ type: '', message: '' })}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="book-detail__header">
                    <div className="book-detail__cover">
                        <img 
                            src={book.cover_image || '/default-book-cover.jpg'} 
                            alt={book.title} 
                        />
                    </div>
                    <div className="book-detail__info">
                        <h1>{book.title}</h1>
                        <div className="book-detail__meta">
                            <span>ISBN: {book.isbn}</span>
                            <span>Language: {book.language}</span>
                            <span>Pages: {book.page_count}</span>
                        </div>
                        <div className="book-detail__price">₹{book.price}</div>
                        <div className="book-detail__stock">
                            {book.stock > 0 ? (
                                <span className="in-stock">In Stock ({book.stock} available)</span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>
                        <button 
                            className="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={book.stock === 0}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>

                <div className="book-detail__content">
                    <div className="book-detail__description">
                        <h2>Description</h2>
                        <p>{book.description}</p>
                    </div>
                    <div className="book-detail__specs">
                        <h2>Details</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Publisher</td>
                                    <td>{book.publisher_details?.name}</td>
                                </tr>
                                <tr>
                                    <td>Publication Date</td>
                                    <td>{book.publication_date}</td>
                                </tr>
                                <tr>
                                    <td>Edition</td>
                                    <td>{book.edition}</td>
                                </tr>
                                <tr>
                                    <td>Dimensions</td>
                                    <td>{book.dimensions}</td>
                                </tr>
                                <tr>
                                    <td>Weight</td>
                                    <td>{book.weight ? `${book.weight}g` : 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="book-detail__authors">
                    <h2>About the Authors</h2>
                    <div className="authors-list">
                        {book.authors_details?.map(author => (
                            <div key={author.id} className="author-card">
                                <img 
                                    src={author.profile_image || '/default-author.jpg'} 
                                    alt={author.user} 
                                />
                                <div className="author-info">
                                    <h4>{author.user}</h4>
                                    <p>{author.bio || 'No biography available'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BookDetail; 