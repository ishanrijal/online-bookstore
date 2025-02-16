import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    const [publishers, setPublishers] = useState([]); // State to store fetched publishers
    const [authors, setAuthors] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPublishers = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/books/publishers/');
                setPublishers(response.data); // Store fetched publishers in state
            } catch (error) {
                console.error('Error fetching publishers:', error);
            }
        };

        fetchPublishers();
    }, []);

    const mockLogin = () => {
        const token = "dummy_token_for_development"; // Your dummy token
        localStorage.setItem('token', token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        mockLogin();
        const newBook = {
            title,
            isbn,
            price,
            stock,
            description,
            category,
            language,
            featured,
            publication_date: publicationDate,
            page_count: pageCount,
            dimensions,
            weight,
            edition,
            average_rating: averageRating,
            total_reviews: totalReviews,
            cover_image: coverImage,
            publisher,
            authors,
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/books/books/', newBook);
            navigate('/admin/manage-books');
        } catch (error) {
            console.error('Error adding book:', error);
        }
    };

    return (
        <form action="/api/books/books/" method="POST" encType="multipart/form-data" className="form-horizontal" onSubmit={handleSubmit}>
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
                        <input name="category" className="form-control" type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
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
                            <option value="">Select a publisher</option>
                            {publishers && publishers.map((pub) => (
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