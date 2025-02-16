import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingBox from '../common/LoadingBox';

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/books/books/${id}/`);
                setBook(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error loading book details:', error);
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to add items to cart');
            navigate('/login');
            return;
        }

        try {
            await axios.post(`http://127.0.0.1:8000/api/orders/carts/1/add_item/`, {
                book_id: book.id,
                quantity: 1
            });
            alert('Book added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add book to cart');
        }
    };

    if (loading) return <LoadingBox message="Loading book details..." />;
    if (!book) return <div>Book not found</div>;

    return (
        <div className="book-detail-page">
            <div className="book-detail-content">
                <div className="book-image">
                    {book.cover_image && (
                        <img src={book.cover_image} alt={book.title} />
                    )}
                </div>
                <div className="book-info">
                    <h1>{book.title}</h1>
                    <p className="book-price">${book.price}</p>
                    <p className="book-description">{book.description}</p>
                    <div className="book-meta">
                        <p>ISBN: {book.isbn}</p>
                        <p>Category: {book.category}</p>
                        <p>Language: {book.language}</p>
                    </div>
                    <button 
                        className="add-to-cart-button"
                        onClick={handleAddToCart}
                        disabled={book.stock <= 0}
                    >
                        {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BookDetail; 