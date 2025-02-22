import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import Header from './Header';
import Footer from './Footer';
import { 
    FaShoppingCart, 
    FaTrashAlt, 
    FaPlus, 
    FaMinus, 
    FaArrowLeft,
    FaShoppingBag,
    FaRupeeSign 
} from 'react-icons/fa';
import '../sass/components/_cart.sass';
import { cartAPI } from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import NotificationBox from './common/NotificationBox';

const Cart = () => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCartItems();
    }, [user, navigate]);

    const fetchCartItems = async () => {
        try {
            const response = await cartAPI.getCurrentCart();
            setCartItems(response.data.items || []);
            setLoading(false);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setError('Failed to load cart items');
            setLoading(false);
        }
    };

    const handleIncrement = async (bookId, currentQuantity) => {
        try {
            await cartAPI.updateQuantity(bookId, currentQuantity + 1);
            await fetchCartItems();
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setNotification({
                type: 'error',
                message: error.response?.data?.error || 'Failed to update quantity'
            });
        }
    };

    const handleDecrement = async (bookId, currentQuantity) => {
        try {
            if (currentQuantity <= 1) {
                await removeItem(bookId);
                return;
            }
            await cartAPI.updateQuantity(bookId, currentQuantity - 1);
            await fetchCartItems();
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setNotification({
                type: 'error',
                message: error.response?.data?.error || 'Failed to update quantity'
            });
        }
    };

    const removeItem = async (bookId) => {
        try {
            await cartAPI.removeCartItem(bookId);
            await fetchCartItems();
            setNotification({
                type: 'success',
                message: 'Item removed successfully'
            });
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setNotification({
                type: 'error',
                message: error.response?.data?.error || 'Failed to remove item'
            });
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const formatPrice = (price) => {
        // Remove leading zeros and format to 2 decimal places only if there are decimal values
        return Number(price).toFixed(2).replace(/^0+/, '');
    };

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <Header />
            <main className="cart">
                {notification.message && (
                    <NotificationBox 
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification({ type: '', message: '' })}
                    />
                )}
                
                <div className="cart__container">
                    <h1>
                        <FaShoppingCart className="icon" /> Your Cart
                    </h1>
                    
                    {cartItems.length === 0 ? (
                        <div className="cart__empty">
                            <FaShoppingBag className="empty-cart-icon" />
                            <p>Your cart is empty</p>
                            <Link to="/" className="btn btn-primary">
                                <FaArrowLeft className="icon" /> Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="cart__items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item__image">
                                        <img 
                                            src={item.book_cover || '/default-book-cover.jpg'} 
                                            alt={item.book_title} 
                                        />
                                    </div>
                                    <div className="cart-item__details">
                                        <Link to={`/book/${item.book}`} className="book-title">
                                            <h3>{item.book_title}</h3>
                                        </Link>
                                        <p className="cart-item__price">
                                            Rs. {formatPrice(item.book_price)}
                                        </p>
                                    </div>
                                    <div className="cart-item__quantity">
                                        <button 
                                            onClick={() => handleDecrement(item.book, item.quantity)}
                                            disabled={item.quantity <= 1}
                                            className="quantity-btn"
                                        >
                                            <FaMinus className="icon" />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => handleIncrement(item.book, item.quantity)}
                                            className="quantity-btn"
                                        >
                                            <FaPlus className="icon" />
                                        </button>
                                    </div>
                                    <div className="cart-item__subtotal">
                                        <span className="label">Subtotal:</span>
                                        <span className="amount">
                                            Rs. {formatPrice(item.subtotal)}
                                        </span>
                                    </div>
                                    <button 
                                        className="cart-item__remove"
                                        onClick={() => removeItem(item.book)}
                                        aria-label="Remove item"
                                    >
                                        <FaTrashAlt className="icon" />
                                    </button>
                                </div>
                            ))}
                            <div className="cart__summary">
                                <div className="cart__summary-details">
                                    <div className="summary-row">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span>Rs. {formatPrice(cartItems.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total</span>
                                        <span>Rs. {formatPrice(cartItems.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary checkout-btn"
                                    onClick={handleCheckout}
                                >
                                    <FaShoppingBag className="icon" /> Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Cart; 