import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../utils/axios';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaSort } from 'react-icons/fa';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import './ManageBooks.css';

function ManageBooks() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [stockFilter, setStockFilter] = useState('all'); // all, inStock, outOfStock
    
    // Sort states
    const [sortField, setSortField] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [booksResponse, categoriesResponse] = await Promise.all([
                axios.get('/books/'),
                axios.get('/categories/')
            ]);
            setBooks(booksResponse.data);
            setCategories(categoriesResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.response?.data?.message || 'Failed to fetch data');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await axios.delete(`/books/${id}/`);
                showNotification('Book deleted successfully', 'success');
                fetchInitialData();
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

        // Apply category filter
        if (selectedCategory) {
            result = result.filter(book => 
                book.categories_details?.some(cat => cat.id === parseInt(selectedCategory))
            );
        }

        // Apply language filter
        if (selectedLanguage) {
            result = result.filter(book => book.language === selectedLanguage);
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

            if (sortField === 'categories') {
                compareA = a.categories_details?.map(cat => cat.name).join(', ') || '';
                compareB = b.categories_details?.map(cat => cat.name).join(', ') || '';
            }

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

    if (loading) return <LoadingBox message="Loading books..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-book-list-wrapper">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="admin-header">
                <h2>Manage Books</h2>
                <Link to="/admin/manage-books/new" className="new-book-button">
                    <FaPlus /> Add New Book
                </Link>
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
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                        <option value="">All Languages</option>
                        <option value="English">English</option>
                        <option value="Nepali">Nepali</option>
                    </select>

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
                        <th onClick={() => handleSort('categories')} className="sortable">
                            Categories {sortField === 'categories' && (
                                <FaSort className={`sort-icon ${sortDirection}`} />
                            )}
                        </th>
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
                        <th onClick={() => handleSort('language')} className="sortable">
                            Language {sortField === 'language' && (
                                <FaSort className={`sort-icon ${sortDirection}`} />
                            )}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedBooks().map((book) => (
                        <tr key={book.id}>
                            <td>
                                <Link 
                                    to={`/admin/books/${book.id}`}
                                    className="book-title-link"
                                >
                                    {book.title}
                                </Link>
                            </td>
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
                            <td>Rs.{book.price}</td>
                            <td className={book.stock === 0 ? 'out-of-stock' : ''}>
                                {book.stock}
                            </td>
                            <td>{book.language}</td>
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
                    ))}
                    {filteredAndSortedBooks().length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No books found matching the filters
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ManageBooks; 