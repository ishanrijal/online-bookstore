import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import './BookCard.css';

export default function BookCard({ book }) {
    return (
        <div className="book-card">
            <div className="book-card__image">
                <img src={book.cover_image} alt={book.title} />
                <div className="book-card__overlay">
                    <Link to={`/book/${book._id}`} className="view-details-btn">
                        View Details
                    </Link>
                    <div className="action-buttons">
                        <button className="wishlist-btn">
                            <FaHeart />
                        </button>
                        <button className="cart-btn">
                            <FaShoppingCart />
                        </button>
                    </div>
                </div>
            </div>
            <div className="book-card__content">
                <Link to={`/book/${book._id}`} className="book-card__title">
                    <h3>{book.title}</h3>
                </Link>
                <div className="book-card__meta">
                    <span className="price">Rs. {book.price}</span>
                    <div className="rating">
                        <span className="stars">{'★'.repeat(Math.round(book.average_rating))}</span>
                        <span className="count">({book.total_reviews})</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 