import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';
import { cartService } from '../../services/cartService';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated] = useState(!!localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const data = await cartService.getCart();
            setCart(data);
        } catch (error) {
            setError('Error fetching cart');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            await cartService.updateQuantity(itemId, newQuantity);
            fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/orders/carts/1/remove_item/`, {
                item_id: itemId
            });
            fetchCart(); // Refresh cart data
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const addToCart = async (bookId, quantity = 1) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/orders/carts/1/add_item/`, {
                book_id: bookId,
                quantity: quantity
            });
            fetchCart(); // Refresh cart data
        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="cart-container">
                <div className="cart-login-prompt">
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your cart</p>
                    <button onClick={() => navigate('/login')} className="login-button">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!cart) return <div>No cart found</div>;

    return (
        <div className="cart-container">
            <h2>Cart functionality coming soon!</h2>
            <p>We're working on implementing the shopping cart feature.</p>
        </div>
    );
}

export default Cart; 