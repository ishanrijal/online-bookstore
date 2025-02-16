import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import '../assets/css/style.css';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';

function Home() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksRes, categoriesRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/books/'),
                    axios.get('http://127.0.0.1:8000/api/categories/')
                ]);

                setBooks(booksRes.data);
                setCategories(categoriesRes.data);
                setFeaturedBooks(booksRes.data.filter(book => book.featured));
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
    }, []);

    const handleAddToCart = async (bookId) => {
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
                'http://127.0.0.1:8000/api/orders/cart/',
                { book_id: bookId, quantity: 1 },
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
                <p className="book-card__author">
                    By {book.authors_details?.map(author => author.user).join(', ')}
                </p>
                <div className="book-card__price">₹{book.price}</div>
                <div className="book-card__actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(book.id)}
                    >
                        Add to Cart
                    </button>
                    <Link 
                        to={`/book/${book.id}`} 
                        className="btn btn-secondary"
                    >
                        View Details
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

            <main className="container">
                {/* Featured Books Section */}
                <section className="featured-books">
                    <h2>Featured Books</h2>
                    <div className="book-grid">
                        {featuredBooks.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </section>

                {/* Categories Section */}
                <section className="categories">
                    <h2>Browse by Category</h2>
                    <div className="category-grid">
                        {categories.map(category => (
                            <Link 
                                key={category.id} 
                                to={`/category/${category.slug}`}
                                className="category-card"
                            >
                                <h3>{category.name}</h3>
                                <span>{category.book_count} Books</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* All Books Section */}
                <section className="all-books">
                    <h2>All Books</h2>
                    <div className="book-grid">
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Home;