import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { FaEdit, FaTrash, FaSort, FaArrowLeft } from 'react-icons/fa';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import './CategoryBooks.css';

function CategoryBooks() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filter and sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [stockFilter, setStockFilter] = useState('all');
    const [sortField, setSortField] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        fetchCategoryAndBooks();
    }, [slug]);

    const fetchCategoryAndBooks = async () => {
        try {
            setLoading(true);
            // First get the category details
            const categoryRes = await axios.get(`/categories/${slug}/`);
            console.log('Category Response:', categoryRes.data);
            setCategory(categoryRes.data);
            
            // Then get books by category using the API endpoint
            const booksRes = await axios.get(`/books/by_category/?category=${slug}`);
            console.log('Books Response:', booksRes.data);
            setBooks(booksRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await axios.delete(`/books/${id}/`);
                showNotification('Book deleted successfully', 'success');
                fetchCategoryAndBooks();
            } catch (error) {
                console.error('Error deleting book:', error);
                showNotification(error.response?.data?.message || 'Failed to delete book', 'error');
            }
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedBooks = () => {
        let result = [...books];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(book => 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply price range filter
        if (priceRange.min) {
            result = result.filter(book => book.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max) {
            result = result.filter(book => book.price <= parseFloat(priceRange.max));
        }

        // Apply stock filter
        if (stockFilter === 'inStock') {
            result = result.filter(book => book.stock > 0);
        } else if (stockFilter === 'outOfStock') {
            result = result.filter(book => book.stock === 0);
        }

        // Apply sorting
        result.sort((a, b) => {
            let compareA = a[sortField];
            let compareB = b[sortField];

            if (typeof compareA === 'string') {
                return sortDirection === 'asc' 
                    ? compareA.localeCompare(compareB)
                    : compareB.localeCompare(compareA);
            }

            return sortDirection === 'asc' 
                ? compareA - compareB 
                : compareB - compareA;
        });

        return result;
    };

    if (loading) return <LoadingBox message="Loading category details..." />;
    if (error) return (
        <div className="error-message">
            {error}
            <button 
                className="btn btn-primary mt-3"
                onClick={fetchCategoryAndBooks}
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="category-books-wrapper">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="category-books-header">
                <div className="header-left">
                    <button 
                        onClick={() => navigate('/admin/manage-categories')} 
                        className="back-button"
                    >
                        <FaArrowLeft /> Back to Categories
                    </button>
                    <h2>{category?.name}</h2>
                </div>
                <Link to="/admin/manage-books/new" className="add-book-button">
                    Add New Book
                </Link>
            </div>

            <div className="category-description">
                <p>{category?.description}</p>
                <div className="category-stats">
                    <span>Total Books: {filteredAndSortedBooks().length}</span>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by title or ISBN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                    >
                        <option value="all">All Stock</option>
                        <option value="inStock">In Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                    </select>

                    <div className="price-range">
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('title')} className="sortable">
                            Title {sortField === 'title' && (
                                <FaSort className={`sort-icon ${sortDirection}`} />
                            )}
                        </th>
                        <th onClick={() => handleSort('isbn')} className="sortable">
                            ISBN {sortField === 'isbn' && (
                                <FaSort className={`sort-icon ${sortDirection}`} />
                            )}
                        </th>
                        <th>Categories</th>
                        <th onClick={() => handleSort('price')} className="sortable">
                            Price {sortField === 'price' && (
                                <FaSort className={`sort-icon ${sortDirection}`} />
                            )}
                        </th>
                        <th onClick={() => handleSort('stock')} className="sortable">
                            Stock {sortField === 'stock' && (
                                <FaSort className={`sort-icon ${sortDirection}`} />
                            )}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedBooks().map((book) => {
                        console.log('Book categories:', book.categories_details);
                        return (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.isbn}</td>
                                <td>
                                    {book.categories_details?.map((cat, index) => (
                                        <React.Fragment key={cat.id}>
                                            <Link 
                                                to={`/admin/categories/${cat.slug}`}
                                                className="category-link"
                                            >
                                                {cat.name}
                                            </Link>
                                            {index < book.categories_details.length - 1 && ', '}
                                        </React.Fragment>
                                    ))}
                                </td>
                                <td>${book.price}</td>
                                <td className={book.stock === 0 ? 'out-of-stock' : ''}>
                                    {book.stock}
                                </td>
                                <td className="actions">
                                    <Link 
                                        to={`/admin/manage-books/edit/${book.id}`} 
                                        className="btn btn-sm btn-warning me-2"
                                    >
                                        <FaEdit /> Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(book.id)} 
                                        className="btn btn-sm btn-danger"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredAndSortedBooks().length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">
                                No books found in this category
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CategoryBooks; 