import React, { createContext, useContext, useState, useCallback } from 'react';
import { wishlistAPI, cartAPI } from '../utils/axios';

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlistCount, setWishlistCount] = useState(0);

    const refreshWishlistCount = useCallback(async () => {
        try {
            const [wishlistRes, cartRes] = await Promise.all([
                wishlistAPI.getWishlist(),
                cartAPI.getCurrentCart()
            ]);

            const cartBookIds = cartRes.data.items.map(item => item.book);
            const filteredWishlist = wishlistRes.data.filter(item => !cartBookIds.includes(item.book));
            setWishlistCount(filteredWishlist.length);
        } catch (error) {
            console.error('Error refreshing wishlist count:', error);
        }
    }, []);

    const updateWishlistCount = (count) => {
        setWishlistCount(count);
    };

    return (
        <WishlistContext.Provider value={{ 
            wishlistCount, 
            updateWishlistCount,
            refreshWishlistCount 
        }}>
            {children}
        </WishlistContext.Provider>
    );
}; 