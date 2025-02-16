import axios from 'axios';

const CART_ID = 1; // For development
const BASE_URL = 'http://127.0.0.1:8000/api/orders';

export const cartService = {
    getCart: async () => {
        const response = await axios.get(`${BASE_URL}/carts/${CART_ID}/`);
        return response.data;
    },

    addItem: async (bookId, quantity = 1) => {
        const response = await axios.post(`${BASE_URL}/carts/${CART_ID}/add_item/`, {
            book_id: bookId,
            quantity
        });
        return response.data;
    },

    updateQuantity: async (itemId, quantity) => {
        const response = await axios.post(`${BASE_URL}/carts/${CART_ID}/update_quantity/`, {
            item_id: itemId,
            quantity
        });
        return response.data;
    },

    removeItem: async (itemId) => {
        const response = await axios.post(`${BASE_URL}/carts/${CART_ID}/remove_item/`, {
            item_id: itemId
        });
        return response.data;
    }
}; 