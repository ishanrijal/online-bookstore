import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingBox from '../common/LoadingBox';
import NotificationBox from '../common/NotificationBox';
import './UserDashboard.css';

const BookForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect if user is not a Publisher
    useEffect(() => {
        if (user?.role !== 'Publisher') {
            navigate('/dashboard/manage-books');
        }
    }, [user, navigate]);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        description: '',
        price: '',
        stock: '',
        language: 'English',
        categories: [],
        cover_image: null,
        preview_pdf: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchBook();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showNotification('Failed to load categories', 'error');
        }
    };

    const fetchBook = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/books/${id}/`);
            const book = response.data;
            setFormData({
                title: book.title,
                isbn: book.isbn,
                description: book.description,
                price: book.price,
                stock: book.stock,
                language: book.language,
                categories: book.categories.map(cat => cat.id),
                cover_image: book.cover_image,
                preview_pdf: book.preview_pdf
            });
            setImagePreview(book.cover_image);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching book:', error);
            showNotification('Failed to load book details', 'error');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                [name]: file
            }));

            // Show image preview for cover image
            if (name === 'cover_image' && file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'select-multiple') {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setFormData(prev => ({
                ...prev,
                [name]: selectedOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'categories') {
                    formData[key].forEach(catId => {
                        form.append('categories', catId);
                    });
                } else if (formData[key] !== null) {
                    form.append(key, formData[key]);
                }
            });

            // Add author or publisher based on user role
            if (user.role === 'Author') {
                form.append('author', user.id);
            } else if (user.role === 'Publisher') {
                form.append('publisher', user.id);
            }

            if (id) {
                await axios.patch(`/books/${id}/`, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                showNotification('Book updated successfully', 'success');
            } else {
                await axios.post('/books/', form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                showNotification('Book created successfully', 'success');
            }

            // Navigate back to book list after short delay
            setTimeout(() => {
                navigate('/dashboard/manage-books');
            }, 2000);

        } catch (error) {
            console.error('Error saving book:', error);
            showNotification(error.response?.data?.detail || 'Failed to save book', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) return <LoadingBox message={id ? "Loading book..." : "Creating book..."} />;

    return (
        <div className="book-form-wrapper">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <h2>{id ? 'Edit Book' : 'Add New Book'}</h2>

            <form onSubmit={handleSubmit} className="book-form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="isbn">ISBN *</label>
                    <input
                        type="text"
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="price">Price *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="stock">Stock *</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="language">Language *</label>
                        <select
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="English">English</option>
                            <option value="Nepali">Nepali</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="categories">Categories *</label>
                    <select
                        id="categories"
                        name="categories"
                        multiple
                        value={formData.categories}
                        onChange={handleInputChange}
                        required
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <small>Hold Ctrl (Windows) or Command (Mac) to select multiple categories</small>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="cover_image">Cover Image {!id && '*'}</label>
                        <input
                            type="file"
                            id="cover_image"
                            name="cover_image"
                            onChange={handleInputChange}
                            accept="image/*"
                            {...(!id && { required: true })}
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Cover preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="preview_pdf">Preview PDF</label>
                        <input
                            type="file"
                            id="preview_pdf"
                            name="preview_pdf"
                            onChange={handleInputChange}
                            accept=".pdf"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/dashboard/manage-books')} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        {id ? 'Update Book' : 'Create Book'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookForm; 