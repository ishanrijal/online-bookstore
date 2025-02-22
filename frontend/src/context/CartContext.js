import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchCart = async () => {
        if (user) {
            try {
                const response = await cartAPI.getCurrentCart();
                setCartItems(response.data.items || []);
            } catch (error) {
                console.error('Error fetching cart:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setCartItems([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const updateCartItem = async (itemId, quantity) => {
        try {
            const response = await cartAPI.updateCartItem(itemId, quantity);
            if (response.data) {
                await fetchCart();
                return true;
            }
            return false;
        } catch (error) {
            if (error.response?.status === 401) {
                // Handle unauthorized access
                window.location.href = '/login';
            }
            console.error('Error updating cart item:', error);
            return false;
        }
    };

    const removeCartItem = async (itemId) => {
        try {
            await cartAPI.removeCartItem(itemId);
            await fetchCart();
            return true;
        } catch (error) {
            console.error('Error removing cart item:', error);
            return false;
        }
    };

    const addToCart = async (bookId, quantity = 1) => {
        try {
            await cartAPI.addToCart(bookId, quantity);
            await fetchCart();
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        }
    };

    return (
        <CartContext.Provider 
            value={{ 
                cartItems, 
                loading, 
                updateCartItem, 
                removeCartItem, 
                addToCart,
                refreshCart: fetchCart 
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 