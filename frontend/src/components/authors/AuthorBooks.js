import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import Breadcrumb from '../common/Breadcrumb';
import Filters from '../common/Filters';
import Pagination from '../common/Pagination';
import { FaHeart, FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import './AuthorBooks.css';

const ITEMS_PER_PAGE = 12;

const AuthorBooks = () => {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        min_price: '',
        max_price: '',
        sort: 'newest'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [authorRes, booksRes, categoriesRes] = await Promise.all([
                    axios.get(`/authors/${id}/`),
                    axios.get('/books/', {
                        params: {
                            author: id,
                            page: currentPage,
                            page_size: ITEMS_PER_PAGE,
                            search: filters.search,
                            category: filters.category,
                            min_price: filters.min_price,
                            max_price: filters.max_price,
                            ordering: filters.sort
                        }
                    }),
                    axios.get('/categories/')
                ]);

                setAuthor(authorRes.data);
                setBooks(booksRes.data.results);
                setTotalPages(Math.ceil(booksRes.data.count / ITEMS_PER_PAGE));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentPage, filters]);

    const breadcrumbItems = [
        { label: 'Authors', path: '/authors' },
        { label: author?.name || 'Loading...', path: `/author/${id}` }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="author-books-page">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="container">
                <div className="author-header">
                    <div className="author-profile">
                        {author.profile_image ? (
                            <img src={author.profile_image} alt={author.name} className="author-image" />
                        ) : (
                            <FaUserCircle className="author-image default" />
                        )}
                        <div className="author-info">
                            <h1>{author.name}</h1>
                            <p className="author-bio">{author.bio || 'No bio available'}</p>
                            <div className="author-stats">
                                <div className="stat">
                                    <span className="stat-value">{author.total_books}</span>
                                    <span className="stat-label">Books</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{author.total_sales}</span>
                                    <span className="stat-label">Sales</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Filters
                    filters={filters}
                    setFilters={setFilters}
                    categories={[]}
                />

                <div className="books-grid">
                    {books.map(book => (
                        <div key={book.id} className="book-card">
                            <div className="book-card__image">
                                <img src={book.cover_image} alt={book.title} />
                                <div className="book-card__overlay">
                                    <Link to={`/book/${book.id}`} className="view-details-btn">
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
                                <Link to={`/book/${book.id}`} className="book-card__title">
                                    <h3>{book.title}</h3>
                                </Link>
                                <div className="book-card__meta">
                                    <span className="price">Rs. {book.price}</span>
                                    <div className="rating">
                                        <span className="stars">{'★'.repeat(Math.round(book.average_rating))}</span>
                                        <span className="count">({book.total_reviews})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default AuthorBooks; 