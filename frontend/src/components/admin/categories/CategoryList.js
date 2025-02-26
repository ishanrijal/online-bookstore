import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../../../utils/axios';
import { FaEdit, FaTrash, FaPlus, FaBook } from 'react-icons/fa';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import LoaderModal from '../../common/LoaderModal';
import './CategoryList.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const trimDescription = (description) => {
        if (!description) return '';
        const words = description.trim().split(/\s+/);
        if (words.length <= 20) return description.trim();
        return words.slice(0, 20).join(' ') + '...';
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            console.log('Fetching categories...');
            const response = await categoryAPI.getAllCategories();
            console.log('Categories response:', response.data);
            setCategories(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching categories:', err);
            const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
            setError(errorMessage);
            setLoading(false);
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async (slug) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setProcessingDelete(true);
            try {
                await categoryAPI.deleteCategory(slug);
                await fetchCategories(); // Refresh the list to get updated book counts
                showNotification('Category deleted successfully', 'success');
            } catch (err) {
                console.error('Error deleting category:', err);
                const errorMessage = err.response?.data?.message || 'Failed to delete category';
                showNotification(errorMessage, 'error');
            } finally {
                setProcessingDelete(false);
            }
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    if (loading) return <LoadingBox message="Loading categories..." />;
    if (error) return (
        <div className="error-container">
            <div className="error">{error}</div>
            <button 
                className="btn btn-primary" 
                onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchCategories();
                }}
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="admin-book-list-wrapper">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {processingDelete && <LoaderModal message="Deleting category..." />}

            <div className="admin-header">
                <h2>Manage Categories</h2>
                <Link to="/admin/manage-categories/new" className="new-book-button">
                    <FaPlus /> Add New Category
                </Link>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>S.N</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Books Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, index) => (
                        <tr key={category.id}>
                            <td>{index + 1}</td>
                            <td>
                                <Link 
                                    to={`/admin/categories/${category.slug}`}
                                    className="category-name-link"
                                >
                                    {category.name}
                                </Link>
                            </td>
                            <td title={category.description}>{trimDescription(category.description)}</td>
                            <td>{category.book_count}</td>
                            <td className="actions">
                                <Link 
                                    to={`/admin/manage-categories/edit/${category.slug}`}
                                    className="btn btn-sm btn-warning me-2"
                                >
                                    <FaEdit /> Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(category.slug)}
                                    className="btn btn-sm btn-danger"
                                    disabled={processingDelete}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">
                                No categories found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryList; 