import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Link } from 'react-router-dom';
import Breadcrumb from '../common/Breadcrumb';
import Filters from '../common/Filters';
import Pagination from '../common/Pagination';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import './BookList.css';

const ITEMS_PER_PAGE = 12;

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        publication: '',
        min_price: '',
        max_price: '',
        ordering: '-created_at' // Django's default ordering field
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [booksRes, categoriesRes, publicationsRes] = await Promise.all([
                    axios.get('/api/books/', {
                        params: {
                            page: currentPage,
                            page_size: ITEMS_PER_PAGE,
                            search: filters.search,
                            category: filters.category,
                            publication: filters.publication,
                            min_price: filters.min_price,
                            max_price: filters.max_price,
                            ordering: filters.ordering
                        }
                    }),
                    axios.get('/api/categories/'),
                    axios.get('/api/publications/')
                ]);

                // Django REST Framework pagination format
                setBooks(booksRes.data.results || []);
                setTotalPages(Math.ceil(booksRes.data.count / ITEMS_PER_PAGE));
                setCategories(categoriesRes.data || []);
                setPublications(publicationsRes.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setBooks([]);
                setCategories([]);
                setPublications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, filters]);

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Books', path: '/books' }
    ];

    return (
        <>
            <Header />
            <main className="main-content">
                <div className="book-list-page">
                    <Breadcrumb items={breadcrumbItems} />
                    
                    <div className="container">
                        <div className="page-header">
                            <h1>All Books</h1>
                            <p>Explore our collection of books</p>
                        </div>

                        <Filters
                            filters={filters}
                            setFilters={setFilters}
                            categories={categories}
                            publications={publications}
                        />

                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : books.length > 0 ? (
                            <>
                                <div className="books-grid">
                                    {books.map(book => (
                                        <div key={book.id} className="book-card">
                                            <div className="book-card__image">
                                                <img src={book.cover_image} alt={book.title} />
                                                <div className="book-card__overlay">
                                                    <Link to={`/books/${book.id}`} className="view-details-btn">
                                                        View Details
                                                    </Link>
                                                    <div className="action-buttons">
                                                        <button className="wishlist-btn">
                                                            <FaHeart />
                                                        </button>
                                                        <button className="cart-btn">
                                                            <FaShoppingCart />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="book-card__content">
                                                <Link to={`/books/${book.id}`} className="book-card__title">
                                                    <h3>{book.title}</h3>
                                                </Link>
                                                <div className="book-card__author">
                                                    by <Link to={`/authors/${book.author.id}`}>{book.author.name}</Link>
                                                </div>
                                                <div className="book-card__meta">
                                                    <span className="price">Rs. {book.price}</span>
                                                    <div className="rating">
                                                        <span className="stars">{'★'.repeat(Math.round(book.average_rating || 0))}</span>
                                                        <span className="count">({book.total_reviews || 0})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="no-books-message">
                                <p>No books found. Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BookList; 