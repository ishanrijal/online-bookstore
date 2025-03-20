import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '../../utils/axios';
import { useWishlist } from '../../context/WishlistContext';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';
import NotificationBox from '../common/NotificationBox';
import LoadingBox from '../common/LoadingBox';
import './Wishlist.css';

const Wishlist = () => {
    const { refreshWishlistCount } = useWishlist();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wishlistRes, cartRes] = await Promise.all([
                wishlistAPI.getWishlist(),
                cartAPI.getCurrentCart()
            ]);
            
            // Filter out wishlist items that are already in cart
            const cartBookIds = cartRes.data.items.map(item => item.book);
            const filteredWishlist = wishlistRes.data.filter(item => !cartBookIds.includes(item.book));
            
            setWishlistItems(filteredWishlist);
            setCartItems(cartRes.data.items);
            await refreshWishlistCount();
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setNotification({
                type: 'error',
                message: 'Failed to load wishlist items'
            });
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (wishlistId) => {
        try {
            await wishlistAPI.removeFromWishlist(wishlistId);
            setNotification({
                type: 'success',
                message: 'Item removed from wishlist'
            });
            await fetchData();
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            setNotification({
                type: 'error',
                message: 'Failed to remove item from wishlist'
            });
        }
    };

    const handleMoveToCart = async (bookId, wishlistId) => {
        try {
            // Add to cart first
            await cartAPI.addToCart(bookId, 1);
            // Then remove from wishlist
            await wishlistAPI.removeFromWishlist(wishlistId);
            
            setNotification({
                type: 'success',
                message: 'Item moved to cart successfully'
            });
            await fetchData();
        } catch (error) {
            console.error('Error moving item to cart:', error);
            setNotification({
                type: 'error',
                message: 'Failed to move item to cart'
            });
        }
    };

    if (loading) return <LoadingBox message="Loading wishlist..." />;

    return (
        <div className="wishlist-container">
            <h2>My Wishlist</h2>
            
            {notification.message && (
                <NotificationBox
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                    <FaHeart className="heart-icon" />
                    <p>Your wishlist is empty</p>
                    <Link to="/" className="browse-books-btn">Browse Books</Link>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlistItems.map(item => (
                        <div key={item.id} className="wishlist-item">
                            <img 
                                src={item.book_cover} 
                                alt={item.book_title} 
                                className="book-cover"
                            />
                            <div className="book-info">
                                <Link to={`/book/${item.book}`} className="book-title">
                                    {item.book_title}
                                </Link>
                                <p className="book-price">Rs. {item.book_price}</p>
                                <div className="action-buttons">
                                    <button
                                        className="move-to-cart-btn"
                                        onClick={() => handleMoveToCart(item.book, item.id)}
                                    >
                                        <FaShoppingCart /> Move to Cart
                                    </button>
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist; 