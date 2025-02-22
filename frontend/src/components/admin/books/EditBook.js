import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
// import '../admin.css';

function EditBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [bookData, setBookData] = useState(null);
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
    const [publisher, setPublisher] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    
    const [publishers, setPublishers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookResponse = await axios.get(`/books/${id}/`);
                const book = bookResponse.data;
                
                setBookData(book);
                
                setTitle(book.title);
                setIsbn(book.isbn);
                setPrice(book.price);
                setStock(book.stock);
                setDescription(book.description);
                setCategory(book.category);
                setLanguage(book.language);
                setFeatured(book.featured);
                setPublicationDate(book.publication_date);
                setPageCount(book.page_count);
                setDimensions(book.dimensions);
                setWeight(book.weight);
                setEdition(book.edition);
                setPublisher(book.publisher);
                
                const [publishersRes, categoriesRes] = await Promise.all([
                    axios.get('/publishers/'),
                    axios.get('/categories/')
                ]);
                
                setPublishers(publishersRes.data);
                setCategories(categoriesRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setNotification({
                    show: true,
                    message: 'Error loading book data',
                    type: 'error'
                });
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
            await axios.put(`/books/${id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
                            {(coverImage || (bookData && bookData.cover_image)) && (
                                <img 
                                    src={coverImage ? URL.createObjectURL(coverImage) : bookData.cover_image} 
                                    alt="Book cover preview" 
                                    className="cover-preview"
                                />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const selectedFile = e.target.files[0];
                                if (selectedFile) {
                                    setCoverImage(selectedFile);
                                }
                            }}
                            className="file-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>ISBN</label>
                        <input
                            type="text"
                            name="isbn"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Price</label>
                        <input
                            type="number"
                            name="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <input
                            type="text"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Language</label>
                        <select
                            name="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
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
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Publication Date</label>
                        <input
                            type="date"
                            name="publication_date"
                            value={publicationDate}
                            onChange={(e) => setPublicationDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Page Count</label>
                        <input
                            type="number"
                            name="page_count"
                            value={pageCount}
                            onChange={(e) => setPageCount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Dimensions</label>
                        <input
                            type="text"
                            name="dimensions"
                            value={dimensions}
                            onChange={(e) => setDimensions(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Weight</label>
                        <input
                            type="text"
                            name="weight"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Edition</label>
                        <input
                            type="text"
                            name="edition"
                            value={edition}
                            onChange={(e) => setEdition(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Publisher</label>
                        <select
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