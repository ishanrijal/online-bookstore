import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';

function EditBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [publishers, setPublishers] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        price: '',
        stock: '',
        description: '',
        category: '',
        language: 'English',
        featured: false,
        publication_date: '',
        page_count: '',
        dimensions: '',
        weight: '',
        edition: '',
        publisher: '',
        authors: []
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const [bookRes, publishersRes, authorsRes, usersRes] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/api/books/books/${id}/`),
                    axios.get('http://127.0.0.1:8000/api/books/publishers/'),
                    axios.get('http://127.0.0.1:8000/api/books/authors/'),
                    axios.get('http://127.0.0.1:8000/api/users/')
                ]);

                console.log(usersRes)

                setFormData({
                    ...bookRes.data,
                    publication_date: bookRes.data.publication_date?.split('T')[0],
                    authors: bookRes.data.authors.map(author => author.id)
                });
                setPublishers(publishersRes.data);
                setAuthors(authorsRes.data);
                setUsers(usersRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching book data:', error);
                setNotification({
                    show: true,
                    message: 'Error loading book data',
                    type: 'error'
                });
                setLoading(false);
            }
        };

        fetchBookData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create preview URL
            const previewUrl = URL.createObjectURL(selectedFile);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            
            // Add all book data to FormData
            Object.keys(formData).forEach(key => {
                if (key !== 'cover_image') {
                    formData.append(key, formData[key]);
                }
            });

            // Add file if it exists
            if (file) {
                formData.append('cover_image', file);
            }

            const response = await axios.put(
                `http://127.0.0.1:8000/api/books/books/${id}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setNotification({
                show: true,
                message: 'Book updated successfully',
                type: 'success'
            });
            setTimeout(() => {
                navigate('/admin/manage-books');
            }, 2000);
        } catch (error) {
            setNotification({
                show: true,
                message: error.response?.data?.detail || 'Error updating book',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingBox message="Loading book data..." />;
    }

    return (
        <div className="edit-book">
            {notification.show && (
                <NotificationBox 
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}
            
            <div className="edit-book__header">
                <h2>Edit Book</h2>
                <button onClick={() => navigate('/admin/manage-books')} className="close-button">
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="edit-book__form">
                <div className="form-grid">
                    <div className="form-group image-upload">
                        <label>Book Cover</label>
                        <div className="image-preview">
                            {(imagePreview || formData.cover_image) && (
                                <img 
                                    src={imagePreview || formData.cover_image} 
                                    alt="Book cover preview" 
                                    className="cover-preview"
                                />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>ISBN</label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Language</label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            required
                        >
                            <option value="English">English</option>
                            <option value="Nepali">Nepali</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Featured</label>
                        <input
                            type="checkbox"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Publication Date</label>
                        <input
                            type="date"
                            name="publication_date"
                            value={formData.publication_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Page Count</label>
                        <input
                            type="number"
                            name="page_count"
                            value={formData.page_count}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Dimensions</label>
                        <input
                            type="text"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Weight</label>
                        <input
                            type="text"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Edition</label>
                        <input
                            type="text"
                            name="edition"
                            value={formData.edition}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Publisher</label>
                        <select
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                            required
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
                        <label>Authors</label>
                        <select
                            multiple
                            name="authors"
                            value={formData.authors}
                            onChange={(e) => {
                                const values = Array.from(
                                    e.target.selectedOptions,
                                    option => option.value
                                );
                                setFormData(prev => ({ ...prev, authors: values }));
                            }}
                        >
                            {authors.map(author => {
                                const user = users.find(u => u.id === author.user);
                                return (
                                    <option key={author.id} value={author.id}>
                                        {user ? `${user.first_name} ${user.last_name} (${user.username})` : 'Loading...'}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Update Book
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditBook; 