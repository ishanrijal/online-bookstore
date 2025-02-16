import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';

function AddBook() {
    const [title, setTitle] = useState('');
    const [isbn, setIsbn] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [language, setLanguage] = useState('English');
    const [featured, setFeatured] = useState(false);
    const [publicationDate, setPublicationDate] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [weight, setWeight] = useState('');
    const [edition, setEdition] = useState('');
    const [averageRating, setAverageRating] = useState('');
    const [totalReviews, setTotalReviews] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [publisher, setPublisher] = useState('');
    const [publishers, setPublishers] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPublishers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/publishers/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setPublishers(response.data);
            } catch (error) {
                console.error('Error fetching publishers:', error);
            }
        };
        fetchPublishers();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/categories/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotifications([]);
        
        const formData = new FormData();
        
        formData.append('title', title);
        formData.append('isbn', isbn);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('language', language);
        formData.append('featured', featured);
        formData.append('publication_date', publicationDate);
        formData.append('page_count', pageCount);
        formData.append('dimensions', dimensions);
        formData.append('weight', weight);
        formData.append('edition', edition);
        formData.append('publisher', publisher);
        
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }

        try {
            await axios.post('/books/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setNotifications([{
                id: Date.now(),
                message: 'Book added successfully',
                type: 'success'
            }]);

            setTimeout(() => {
                navigate('/admin/manage-books');
            }, 2000);
        } catch (error) {
            if (error.response?.data) {
                const errors = error.response.data;
                const errorMessages = [];
                
                Object.entries(errors).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach(message => {
                            errorMessages.push({
                                id: Date.now() + Math.random(),
                                message: `${field}: ${message}`,
                                type: 'error'
                            });
                        });
                    }
                });
                
                setNotifications(errorMessages);
            } else {
                setNotifications([{
                    id: Date.now(),
                    message: 'Error adding book',
                    type: 'error'
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingBox message="Adding new book..." />;
    }

    return (
        <div className="add-book">
            <div className="notifications-container">
                {notifications.map(notification => (
                    <NotificationBox 
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotifications(notifications.filter(n => n.id !== notification.id))}
                    />
                ))}
            </div>
            
            <div className="add-book__header">
                <h2>Add New Book</h2>
                <button onClick={() => navigate('/admin/manage-books')} className="close-button">
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="add-book__form">
                <fieldset>
                    <div className="form-group">
                        <label className="col-sm-2 control-label">Title</label>
                        <div className="col-sm-10">
                            <input name="title" className="form-control" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">ISBN</label>
                        <div className="col-sm-10">
                            <input name="isbn" className="form-control" type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Price</label>
                        <div className="col-sm-10">
                            <input name="price" className="form-control" type="text" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Stock</label>
                        <div className="col-sm-10">
                            <input name="stock" className="form-control" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Description</label>
                        <div className="col-sm-10">
                            <textarea name="description" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Category</label>
                        <div className="col-sm-10">
                            <select
                                className="form-control"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Language</label>
                        <div className="col-sm-10">
                            <select className="form-control" name="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="English">English</option>
                                <option value="Nepali">Nepali</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Featured</label>
                        <div className="col-sm-10">
                            <input type="checkbox" name="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Publication Date</label>
                        <div className="col-sm-10">
                            <input name="publication_date" className="form-control" type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Page Count</label>
                        <div className="col-sm-10">
                            <input name="page_count" className="form-control" type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Dimensions</label>
                        <div className="col-sm-10">
                            <input name="dimensions" className="form-control" type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Weight</label>
                        <div className="col-sm-10">
                            <input name="weight" className="form-control" type="text" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Edition</label>
                        <div className="col-sm-10">
                            <input name="edition" className="form-control" type="text" value={edition} onChange={(e) => setEdition(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Average Rating</label>
                        <div className="col-sm-10">
                            <input name="average_rating" className="form-control" type="text" value={averageRating} onChange={(e) => setAverageRating(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Total Reviews</label>
                        <div className="col-sm-10">
                            <input name="total_reviews" className="form-control" type="number" value={totalReviews} onChange={(e) => setTotalReviews(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Cover Image</label>
                        <div className="col-sm-10">
                            <input name="cover_image" type="file" onChange={(e) => setCoverImage(e.target.files[0])} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Publisher</label>
                        <div className="col-sm-10">
                            <select
                                className="form-control"
                                name="publisher"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
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
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Authors</label>
                        <div className="col-sm-10">
                            <select multiple className="form-control" name="authors" value={authors} onChange={(e) => setAuthors(Array.from(e.target.selectedOptions, option => option.value))}>
                                <option value="1">admin</option>
                                {/* Add more authors as needed */}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary" type="submit">Add Book</button>
                    </div>
                </fieldset>
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