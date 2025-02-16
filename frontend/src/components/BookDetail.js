import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import Header from './Header';
import Footer from './Footer';
import '../sass/components/_bookDetail.sass';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInCart, setIsInCart] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookRes, cartRes] = await Promise.all([
                    axios.get(`/books/${id}/`),
                    axios.get('/orders/carts/current/')
                ]);

                setBook(bookRes.data);
                // Check if book is in cart
                const cartItems = cartRes.data.items || [];
                setIsInCart(cartItems.some(item => item.book === parseInt(id)));
                setLoading(false);
            } catch (error) {
                if (error.response?.status !== 401) { // Ignore auth errors for cart
                    setNotification({
                        type: 'error',
                        message: 'Failed to load book details'
                    });
                }
                const bookRes = await axios.get(`/books/${id}/`);
                setBook(bookRes.data);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            await axios.post('/orders/carts/add_item/', {
                book_id: id,
                quantity: 1
            });

            setIsInCart(true);
            setNotification({
                type: 'success',
                message: 'Book added to cart successfully!'
            });
        } catch (error) {
            let errorMessage = 'Failed to add book to cart';
            
            if (error.response?.status === 401) {
                errorMessage = 'Please login to add items to cart';
                navigate('/login');
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            setNotification({
                type: 'error',
                message: errorMessage
            });
        }
    };

    const handleRemoveFromCart = async () => {
        try {
            // First get the user's cart
            const cartRes = await axios.get('/orders/carts/current/');
            const cart = cartRes.data;
            const cartItem = cart.items.find(item => item.book === parseInt(id));
            
            if (cartItem) {
                // Use the correct endpoint with cart ID
                await axios.post(`/orders/carts/${cart.id}/remove_item/`, {
                    item_id: cartItem.id
                });
                setIsInCart(false);
                setNotification({
                    type: 'success',
                    message: 'Book removed from cart successfully!'
                });
            }
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to remove book from cart'
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
                        <div className="book-detail__actions">
                            {isInCart ? (
                                <>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={handleRemoveFromCart}
                                    >
                                        Remove from Cart
                                    </button>
                                    <Link 
                                        to="/cart" 
                                        className="btn btn-primary"
                                    >
                                        View Cart
                                    </Link>
                                </>
                            ) : (
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleAddToCart}
                                    disabled={book?.stock === 0}
                                >
                                    {book?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
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