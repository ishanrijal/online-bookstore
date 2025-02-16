import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import '../sass/components/_cart.sass';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://127.0.0.1:8000/api/orders/carts/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(response.data);
            setLoading(false);
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to load cart'
            });
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://127.0.0.1:8000/api/orders/cart/items/${itemId}/`,
                { quantity: newQuantity },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchCart(); // Refresh cart after update
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update quantity'
            });
        }
    };

    const removeItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://127.0.0.1:8000/api/orders/cart/items/${itemId}/`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchCart(); // Refresh cart after removal
            setNotification({
                type: 'success',
                message: 'Item removed from cart'
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to remove item'
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="cart">
                {notification.message && (
                    <div className={`notification-box notification-box--${notification.type}`}>
                        <span>{notification.message}</span>
                        <button 
                            className="notification-box__close"
                            onClick={() => setNotification({ type: '', message: '' })}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="cart__container">
                    <h1>Shopping Cart</h1>
                    
                    {cart?.items_count === 0 ? (
                        <div className="cart__empty">
                            <p>Your cart is empty</p>
                            <Link to="/" className="btn btn-primary">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="cart__items">
                                {cart?.items.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item__image">
                                            <img 
                                                src={item.book_cover || '/default-book-cover.jpg'} 
                                                alt={item.book_title} 
                                            />
                                        </div>
                                        <div className="cart-item__details">
                                            <Link to={`/book/${item.book}`}>
                                                <h3>{item.book_title}</h3>
                                            </Link>
                                            <p className="cart-item__price">
                                                ₹{item.book_price}
                                            </p>
                                        </div>
                                        <div className="cart-item__quantity">
                                            <button 
                                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item__subtotal">
                                            ₹{item.subtotal}
                                        </div>
                                        <button 
                                            className="cart-item__remove"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart__summary">
                                <div className="cart__summary-details">
                                    <div className="summary-row">
                                        <span>Subtotal ({cart?.items_count} items):</span>
                                        <span>₹{cart?.total_price}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total:</span>
                                        <span>₹{cart?.total_price}</span>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary checkout-btn"
                                    onClick={() => navigate('/checkout')}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Cart; 