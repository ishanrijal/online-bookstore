import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { cartAPI } from '../utils/axios';
import '../assets/css/style.css';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';
import { FaShoppingCart, FaInfoCircle, FaShoppingBag } from 'react-icons/fa';
import NotificationBox from './common/NotificationBox';

function Home() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [mostSellingBooks, setMostSellingBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksRes, categoriesRes] = await Promise.all([
                    axios.get('/books/'),
                    axios.get('/categories/')
                ]);

                const allBooks = booksRes.data;
                setBooks(allBooks);
                setCategories(categoriesRes.data);
                setFeaturedBooks(allBooks.filter(book => book.featured));
                
                // Sort books by total_reviews as a proxy for most selling
                const sortedByReviews = [...allBooks].sort((a, b) => b.total_reviews - a.total_reviews);
                setMostSellingBooks(sortedByReviews.slice(0, 4));
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setNotification({
                    type: 'error',
                    message: 'Failed to load books. Please try again later.'
                });
                setLoading(false);
            }
        };

        fetchData();
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await cartAPI.getCurrentCart();
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const isInCart = (bookId) => {
        return cartItems.some(item => item.book === bookId);
    };

    const handleAddToCart = async (bookId) => {
        try {
            await cartAPI.addToCart(bookId, 1);
            await fetchCartItems(); // Refresh cart items
            
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

    const BookCard = ({ book }) => (
        <div className="book-card">
            <div className="book-card__image">
                <img 
                    src={book.cover_image || '/default-book-cover.jpg'} 
                    alt={book.title} 
                />
            </div>
            <div className="book-card__content">
                <h3 className="book-card__title">{book.title}</h3>
                <div className="book-card__meta">
                    <span className="price">Rs.{book.price}</span>
                    <div className="rating">
                        <span className="stars">{'★'.repeat(Math.round(book.average_rating))}</span>
                        <span className="count">({book.total_reviews} reviews)</span>
                    </div>
                </div>
                <div className="book-card__actions">
                    {isInCart(book.id) ? (
                        <Link to="/cart" className="view-cart">
                            <FaShoppingBag className="icon" />
                            <span>View Cart</span>
                        </Link>
                    ) : (
                        <button 
                            className="add-to-cart"
                            onClick={() => handleAddToCart(book.id)}
                        >
                            <FaShoppingCart className="icon" />
                            <span>Add to Cart</span>
                        </button>
                    )}
                    <Link 
                        to={`/book/${book.id}`} 
                        className="view-details"
                    >
                        <FaInfoCircle className="icon" />
                        <span>View Details</span>
                    </Link>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="home">
            <Header />
            <Banner />

            {notification.message && (
                <NotificationBox 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <main className="container">
                {/* Featured Books Section */}
                <section className="featured-books section">
                    <div className="container">
                        <h2 className="section-title">Featured Books</h2>
                        <div className="book-grid">
                            {featuredBooks.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Most Selling Books Section */}
                <section className="most-selling section">
                    <div className="container">
                        <h2 className="section-title">Most Popular Books</h2>
                        <div className="book-grid">
                            {mostSellingBooks.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="categories section">
                    <div className="container">
                        <h2 className="section-title">Browse by Category</h2>
                        <div className="category-grid">
                            {categories.map(category => (
                                <Link 
                                    key={category.id} 
                                    to={`/category/${category.slug}`}
                                    className="category-card"
                                >
                                    <h3>{category.name}</h3>
                                    <span className="book-count">{category.book_count} Books</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* All Books Section */}
                <section className="all-books section">
                    <div className="container">
                        <h2 className="section-title">All Books</h2>
                        <div className="book-grid">
                            {books.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Home;