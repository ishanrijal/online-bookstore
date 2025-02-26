import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaSort } from 'react-icons/fa';
import LoadingBox from '../common/LoadingBox';
import NotificationBox from '../common/NotificationBox';
import './UserDashboard.css';

function ManageUserBooks() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [stockFilter, setStockFilter] = useState('all');
    
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

            console.log('Books response:', booksResponse.data);
            console.log('Categories response:', categoriesResponse.data);

            // Filter books based on logged-in author's ID for Author role
            let filteredBooks = booksResponse.data;
            if (user.role === 'Author') {
                filteredBooks = booksResponse.data.filter(book => 
                    book.authors.some(author => author.user === user.id)
                );
            } else if (user.role === 'Publisher') {
                // For publishers, show all their published books
                filteredBooks = booksResponse.data.filter(book => 
                    book.publisher === user.id
                );
            }

            // Map category IDs to full category objects with error handling
            filteredBooks = filteredBooks.map(book => ({
                ...book,
                categories: Array.isArray(book.categories) 
                    ? book.categories.map(catId => {
                        const category = categoriesResponse.data.find(cat => cat.id === catId);
                        if (!category) {
                            console.warn(`Category with ID ${catId} not found for book ${book.title}`);
                            return { id: catId, name: 'Unknown Category', description: 'Category not found' };
                        }
                        return category;
                    })
                    : []
            }));

            console.log('Filtered books with category names:', filteredBooks);
            setBooks(filteredBooks);
            setCategories(categoriesResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error response:', error.response);
            setError(error.response?.data?.detail || 'Failed to fetch data');
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
                showNotification(error.response?.data?.detail || 'Failed to delete book', 'error');
            }
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
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
                book.categories?.some(cat => cat.id === parseInt(selectedCategory))
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
                compareA = a.categories?.map(cat => cat.name).join(', ') || '';
                compareB = b.categories?.map(cat => cat.name).join(', ') || '';
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

    // Helper function to get category color based on book count
    const getCategoryColor = (bookCount) => {
        if (bookCount === 0) return '#ffd1d1'; // Light red for unused categories
        if (bookCount < 3) return '#fff2cc'; // Light yellow for less used
        return '#d1ffd1'; // Light green for frequently used
    };

    if (loading) return <LoadingBox message="Loading your books..." />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="user-books-container">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="user-books-header">
                <h2>Manage Books</h2>
                {user.role === 'Publisher' && (
                    <Link to="/dashboard/manage-books/new" className="add-book-btn">
                        <FaPlus /> Add New Book
                    </Link>
                )}
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
                        className="category-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option 
                                key={category.id} 
                                value={category.id}
                                style={{
                                    backgroundColor: getCategoryColor(category.book_count)
                                }}
                            >
                                {category.name} ({category.book_count})
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

            {loading ? (
                <LoadingBox message="Loading books..." />
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : books.length === 0 ? (
                <div className="no-books-message">
                    {user.role === 'Publisher' 
                        ? "You haven't published any books yet. Click 'Add New Book' to get started."
                        : "No books have been assigned to you yet."}
                </div>
            ) : (
                <table className="user-books-table">
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
                            {user.role === 'Publisher' && (
                                <th>Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedBooks().map((book) => (
                            <tr key={book.id}>
                                <td>
                                    {user.role === 'Publisher' ? (
                                        <Link 
                                            to={`/dashboard/manage-books/${book.id}`}
                                            className="book-title-link"
                                        >
                                            {book.title}
                                        </Link>
                                    ) : (
                                        <span>{book.title}</span>
                                    )}
                                </td>
                                <td>{book.isbn}</td>
                                <td className="categories-cell">
                                    {book.categories?.length > 0 ? (
                                        book.categories.map((cat, index) => (
                                            <span 
                                                key={cat.id}
                                                className="category-tag"
                                                data-tooltip={cat.description || 'No description available'}
                                                style={{
                                                    backgroundColor: getCategoryColor(cat.book_count),
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    margin: '0 2px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {cat.name}
                                                {index < book.categories.length - 1 && ' '}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="no-category">No categories</span>
                                    )}
                                </td>
                                <td>Rs.{book.price}</td>
                                <td className={book.stock === 0 ? 'out-of-stock' : ''}>
                                    {book.stock}
                                </td>
                                <td>{book.language}</td>
                                <td>
                                    {user.role === 'Publisher' && (
                                        <div className="actions">
                                            <Link
                                                to={`/dashboard/manage-books/edit/${book.id}`}
                                                className="edit-btn"
                                            >
                                                <FaEdit /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="delete-btn"
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ManageUserBooks; 