import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice, calculateCartTotal, calculateItemSubtotal } from '../../utils/cartUtils';
import { cartAPI } from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import NotificationBox from '../common/NotificationBox';
import { 
    FaShoppingCart, 
    FaTrashAlt, 
    FaPlus, 
    FaMinus, 
    FaArrowLeft,
    FaShoppingBag,
    FaRupeeSign 
} from 'react-icons/fa';
import './UserDashboard.css';

const DashboardCart = () => {
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
            console.log('Dashboard Cart Response:', response.data);
            const items = response.data.items || [];
            console.log('Dashboard Cart Items:', items);
            setCartItems(items);
            setLoading(false);
        } catch (error) {
            console.error('Dashboard Cart fetch error:', error);
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

    // Calculate total price for debugging
    const debugTotal = () => {
        if (!cartItems.length) {
            console.log('No cart items');
            return 0;
        }

        const total = cartItems.reduce((sum, item) => {
            const price = Number(item.book_price) || 0;
            const quantity = Number(item.quantity) || 0;
            const itemTotal = price * quantity;
            console.log(`Item: ${item.book_title}, Price: ${price}, Quantity: ${quantity}, Total: ${itemTotal}`);
            return sum + itemTotal;
        }, 0);

        console.log('Final Total:', total);
        return total;
    };

    if (loading) {
        return <div className="loading">Loading cart...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard-cart">
            {notification.message && (
                <NotificationBox 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}
            
            <div className="dashboard-cart__header">
                <h2><FaShoppingCart /> Your Cart</h2>
            </div>
            
            {cartItems.length === 0 ? (
                <div className="dashboard-cart__empty">
                    <FaShoppingBag className="empty-cart-icon" />
                    <p>Your cart is empty</p>
                    <Link to="/" className="btn btn-primary">
                        <FaArrowLeft className="icon" /> Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="dashboard-cart__items">
                    {cartItems.map(item => {
                        const itemSubtotal = calculateItemSubtotal(item);
                        console.log(`Item ${item.book_title} subtotal:`, itemSubtotal);
                        
                        return (
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
                                        <FaRupeeSign className="rupee-icon" /> 
                                        {formatPrice(item.book_price)}
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
                                        <FaRupeeSign className="rupee-icon" /> 
                                        {formatPrice(itemSubtotal)}
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
                        );
                    })}
                    <div className="dashboard-cart__summary">
                        {console.log('Cart Items for total:', cartItems)}
                        <div className="cart__summary-details">
                            <div className="summary-row">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>
                                    <FaRupeeSign className="rupee-icon" /> 
                                    {formatPrice(debugTotal())}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>
                                    <FaRupeeSign className="rupee-icon" /> 
                                    {formatPrice(debugTotal())}
                                </span>
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
    );
};

export default DashboardCart; 