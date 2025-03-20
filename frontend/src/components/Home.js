import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { cartAPI, wishlistAPI } from '../utils/axios';
import '../assets/css/style.css';
import './Home.css';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';
import { FaShoppingCart, FaInfoCircle, FaShoppingBag, FaArrowRight, FaUserCircle, FaHeart } from 'react-icons/fa';
import NotificationBox from './common/NotificationBox';
import { useAuth } from '../context/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

function Home() {
    const { user } = useAuth();
    const { refreshWishlistCount } = useWishlist();
    const { refreshCartCount } = useCart();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [cartItems, setCartItems] = useState([]);
    const [visibleBooks, setVisibleBooks] = useState(6);
    const navigate = useNavigate();
    const [authorDetails, setAuthorDetails] = useState({});
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksRes, categoriesRes, authorsRes] = await Promise.all([
                    axios.get('/books/'),
                    axios.get('/categories/'),
                    axios.get('/authors/')
                ]);

                const allBooks = booksRes.data;
                setBooks(allBooks);
                setCategories(categoriesRes.data);
                setFeaturedBooks(allBooks.filter(book => book.featured).slice(0, 3));

                // Fetch wishlist items if user is logged in
                if (user) {
                    const wishlistRes = await wishlistAPI.getWishlist();
                    setWishlistItems(wishlistRes.data.map(item => item.book));
                }

                // Fetch detailed author information
                const authorsData = authorsRes.data;
                const authorDetailsPromises = authorsData.map(async (author) => {
                    try {
                        // First get author details
                        const authorResponse = await axios.get(`/authors/${author.id}/`);
                        // Then get user details associated with the author
                        const userResponse = await axios.get(`/users/${authorResponse.data.user}/`);
                        return {
                            ...authorResponse.data,
                            user: userResponse.data
                        };
                    } catch (error) {
                        console.error(`Error fetching details for author ${author.id}:`, error);
                        return author;
                    }
                });

                const authorsWithDetails = await Promise.all(authorDetailsPromises);
                setAuthors(authorsWithDetails);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setNotification({
                    type: 'error',
                    message: 'Failed to load data. Please try again later.'
                });
                setLoading(false);
            }
        };

        fetchData();
        if (user) {
            fetchCartItems();
        }
    }, [user]);

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

    const isInWishlist = (bookId) => {
        return wishlistItems.includes(bookId);
    };

    const handleAddToCart = async (bookId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await cartAPI.addToCart(bookId, 1);
            await fetchCartItems();
            await refreshCartCount();
            
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

    const handleAddToWishlist = async (bookId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (isInWishlist(bookId)) {
                const wishlistItem = wishlistItems.find(item => item.book === bookId);
                await wishlistAPI.removeFromWishlist(wishlistItem.id);
                setWishlistItems(prev => prev.filter(id => id !== bookId));
                await refreshWishlistCount();
                setNotification({
                    type: 'success',
                    message: 'Removed from wishlist!'
                });
            } else {
                await wishlistAPI.addToWishlist(bookId);
                setWishlistItems(prev => [...prev, bookId]);
                await refreshWishlistCount();
                setNotification({
                    type: 'success',
                    message: 'Added to wishlist!'
                });
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setNotification({
                type: 'error',
                message: 'Failed to update wishlist'
            });
        }
    };

    const BookCard = ({ book }) => (
        <div className="book-card">
            <div className="book-card__image">
                <img 
                    src={book.cover_image || '/default-book-cover.jpg'} 
                    alt={book.title} 
                    loading="lazy"
                />
                <div className="book-card__overlay">
                    {user?.role === 'Reader' && (
                        <div className="action-buttons">
                            {isInCart(book.id) ? (
                                <>
                                    <div className="status-message cart-status">
                                        Product is in Cart
                                    </div>
                                    <Link to="/cart" className="view-cart-btn">
                                        <FaShoppingBag className="icon" />
                                        <span>View Cart</span>
                                    </Link>
                                </>
                            ) : isInWishlist(book.id) ? (
                                <>
                                    <div className="status-message wishlist-status">
                                        Product is in Wishlist
                                    </div>
                                    <Link to="/dashboard/wishlist" className="view-wishlist-btn">
                                        <FaHeart className="icon" />
                                        <span>View Wishlist</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => handleAddToWishlist(book.id)}
                                        className="wishlist-btn"
                                    >
                                        <FaHeart className="icon" />
                                        <span>Add to Wishlist</span>
                                    </button>
                                    <button 
                                        className="add-to-cart"
                                        onClick={() => handleAddToCart(book.id)}
                                    >
                                        <FaShoppingCart className="icon" />
                                        <span>Add to Cart</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="book-card__content">
                <Link to={`/book/${book.id}`} className="book-card__title">
                    <h3>{book.title}</h3>
                </Link>
                <div className="book-card__meta">
                    <span className="price">Rs.{book.price}</span>
                    <div className="rating">
                        <span className="stars">{'★'.repeat(Math.round(book.average_rating))}</span>
                        <span className="count">({book.total_reviews} reviews)</span>
                    </div>
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
                {/* Categories Section with Swiper */}
                <section className="categories section">
                    <div className="container">
                        <h2 className="section-title">Browse by Category</h2>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={6}
                            navigation
                            pagination={{ clickable: true }}
                            className="category-slider"
                            breakpoints={{
                                320: { slidesPerView: 2 },
                                640: { slidesPerView: 3 },
                                768: { slidesPerView: 4 },
                                1024: { slidesPerView: 6 }
                            }}
                        >
                            {categories.map(category => (
                                <SwiperSlide key={category.id}>
                                    <Link 
                                        to={`/category/${category.slug}`}
                                        className="category-card"
                                    >
                                        <h3>{category.name}</h3>
                                        <span className="book-count">{category.book_count} Books</span>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>

                {/* Featured Books Section */}
                <section className="featured-books section">
                    <div className="container">
                        <h2 className="section-title">Featured Books</h2>
                        <div className="book-grid featured-grid">
                            {featuredBooks.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                        <div className="view-more-container">
                            <Link to="/books/featured" className="view-more-btn">
                                View More Books <FaArrowRight className="icon" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* All Books Section */}
                <section className="all-books section">
                    <div className="container">
                        <h2 className="section-title">Explore Our Collection</h2>
                        <div className="book-grid">
                            {books.slice(0, visibleBooks).map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                        {visibleBooks < books.length && (
                            <div className="view-more-container">
                                <button 
                                    className="view-more-btn"
                                    onClick={() => setVisibleBooks(prev => prev + 6)}
                                >
                                    Load More Books <FaArrowRight className="icon" />
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Authors Section */}
                <section className="authors section">
                    <div className="container">
                        <h2 className="section-title">Bestselling Authors</h2>
                        <p className="section-subtitle">Discover Books by Bestselling Authors in Our Collection, Ranked by Popularity.</p>
                        <div className="authors-grid">
                            {authors.map(author => (
                                <Link 
                                    key={author.id} 
                                    to={`/author/${author.id}`}
                                    className="author-card"
                                >
                                    <div className="author-image">
                                        {author.user?.profile_image ? (
                                            <img 
                                                src={author.user.profile_image} 
                                                alt={author.user.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <FaUserCircle className="default-avatar" />
                                        )}
                                    </div>
                                    <h3 className="author-name">
                                        {author.user?.name || 'Unknown Author'}
                                    </h3>
                                </Link>
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