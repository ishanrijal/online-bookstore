import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to add auth token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token expiration and refresh
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post('/users/token/refresh/', {
                    refresh: refreshToken
                });

                localStorage.setItem('access_token', response.data.access);
                
                // Retry the original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Cart related API calls
const cartAPI = {
    // Get current cart
    getCurrentCart: () => instance.get('/orders/carts/current/'),
    
    // Update quantity
    updateQuantity: (bookId, quantity) => 
        instance.patch('/orders/carts/update_quantity/', {
            book_id: bookId,
            quantity: quantity
        }),
    
    // Remove item
    removeCartItem: (bookId) => 
        instance.post('/orders/carts/remove_item/', {
            book_id: bookId
        }),
    
    // Add to cart
    addToCart: (bookId, quantity = 1) => 
        instance.post('/orders/carts/add_item/', {
            book_id: bookId,
            quantity: quantity
        })
};

export { cartAPI };
export default instance; 