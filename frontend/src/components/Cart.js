import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
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
            const response = await axios.get('/orders/carts/current/');
            setCart(response.data);
            setLoading(false);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setNotification({
                type: 'error',
                message: 'Failed to load cart'
            });
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            const cartId = cart.id;
            await axios.post(`/orders/carts/${cartId}/update_quantity/`, {
                item_id: itemId,
                quantity: newQuantity
            });
            fetchCart(); // Refresh cart after update
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.error || 'Failed to update quantity'
            });
        }
    };

    const removeItem = async (itemId) => {
        try {
            const cartId = cart.id;
            await axios.post(`/orders/carts/${cartId}/remove_item/`, {
                item_id: itemId
            });
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

    const handleCheckout = () => {
        navigate('/checkout');
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
                    
                    {!cart?.items?.length ? (
                        <div className="cart__empty">
                            <p>Your cart is empty</p>
                            <Link to="/" className="btn btn-primary">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="cart__items">
                                {cart.items.map(item => (
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
                                            aria-label="Remove item"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart__summary">
                                <div className="cart__summary-details">
                                    <div className="summary-row">
                                        <span>Subtotal ({cart.items_count} items):</span>
                                        <span>₹{cart.total_price}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total:</span>
                                        <span>₹{cart.total_price}</span>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary checkout-btn"
                                    onClick={handleCheckout}
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