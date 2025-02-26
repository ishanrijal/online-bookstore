import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import LoaderModal from '../../common/LoaderModal';
import './AddBook.css';

function AddBook() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        price: '',
        stock: '',
        description: '',
        selectedCategories: [],
        language: 'English',
        featured: false,
        publication_date: '',
        page_count: '',
        dimensions: '',
        weight: '',
        edition: '',
        publisher: '',
    });
    
    const [coverImage, setCoverImage] = useState(null);
    const [publishers, setPublishers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [publishersRes, categoriesRes] = await Promise.all([
                axios.get('/publishers/'),
                axios.get('/categories/')
            ]);
            setPublishers(publishersRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showNotification('Failed to load required data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(categoryId)
                ? prev.selectedCategories.filter(id => id !== categoryId)
                : [...prev.selectedCategories, categoryId]
        }));
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataToSend = new FormData();
            
            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'selectedCategories') {
                    formData[key].forEach(categoryId => {
                        formDataToSend.append('categories', categoryId);
                    });
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append cover image if selected
            if (coverImage) {
                formDataToSend.append('cover_image', coverImage);
            }

            await axios.post('/books/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showNotification('Book added successfully', 'success');
            setTimeout(() => {
                navigate('/admin/manage-books');
            }, 1500);
        } catch (error) {
            console.error('Error adding book:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add book';
            showNotification(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingBox message="Loading..." />;

    return (
        <div className="edit-book">
            {notification && (
                <NotificationBox 
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {saving && <LoaderModal message="Adding book..." />}
            
            <div className="edit-book__header">
                <h2>Add New Book</h2>
                <button onClick={() => navigate('/admin/manage-books')} className="close-button">
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="edit-book__form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>ISBN *</label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Price *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            disabled={saving}
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock *</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Categories *</label>
                        <div className="categories-checkbox-group">
                            {categories.map(category => (
                                <div key={category.id} className="category-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`category-${category.id}`}
                                        checked={formData.selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                        disabled={saving}
                                    />
                                    <label htmlFor={`category-${category.id}`}>
                                        {category.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Language *</label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        >
                            <option value="English">English</option>
                            <option value="Nepali">Nepali</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Publisher *</label>
                        <select
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        >
                            <option value="">Select Publisher</option>
                            {publishers.map(pub => (
                                <option key={pub.id} value={pub.id}>
                                    {pub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Featured</label>
                        <div className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Publication Date *</label>
                        <input
                            type="date"
                            name="publication_date"
                            value={formData.publication_date}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Page Count *</label>
                        <input
                            type="number"
                            name="page_count"
                            value={formData.page_count}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Dimensions</label>
                        <input
                            type="text"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            placeholder="e.g., 5.5 x 8.5 inches"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Weight</label>
                        <input
                            type="text"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="e.g., 500g"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Edition</label>
                        <input
                            type="text"
                            name="edition"
                            value={formData.edition}
                            onChange={handleChange}
                            placeholder="e.g., 1st Edition"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            disabled={saving}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                            disabled={saving}
                            className="file-input"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin/manage-books')}
                        className="btn btn-secondary"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={saving}
                    >
                        {saving ? 'Adding Book...' : 'Add Book'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddBook; 




// {
//     "title": "Example Book Title",
//     "isbn": "1234567890123",
//     "price": 19.99,
//     "authors": [1, 2],  // List of author IDs
//     "category": "Fiction",
//     "language": "English",
//     "description": "A brief description of the book.",
//     "stock": 10,
//     "featured": false,
//     "publication_date": "2025-01-01",
//     "page_count": 300,
//     "dimensions": "5.5 x 8.5 inches",
//     "weight": 500.00,
//     "edition": "1st",
//     "cover_image": "url_to_cover_image" // Optional
// }