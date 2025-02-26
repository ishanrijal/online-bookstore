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
        console.log('Token from localStorage:', token ? 'Present' : 'Not found');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Added Authorization header');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Handle token expiration and refresh
instance.interceptors.response.use(
    response => response,
    async error => {
        console.error('Response error:', error.response?.status, error.response?.data);
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Attempting token refresh...');
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    console.error('No refresh token found');
                    throw new Error('No refresh token');
                }

                const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                const newToken = response.data.access;
                localStorage.setItem('access_token', newToken);
                console.log('Token refreshed successfully');
                
                // Retry the original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
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

// Category related API calls
const categoryAPI = {
    // Get all categories
    getAllCategories: () => instance.get('/categories/'),
    
    // Get single category
    getCategory: (slug) => instance.get(`/categories/${slug}/`),
    
    // Create new category
    createCategory: (categoryData) => instance.post('/categories/', categoryData),
    
    // Update category
    updateCategory: (slug, categoryData) => instance.put(`/categories/${slug}/`, categoryData),
    
    // Delete category
    deleteCategory: (slug) => instance.delete(`/categories/${slug}/`),
    
    // Get books by category
    getBooksByCategory: (slug) => instance.get(`/books/by_category/?category=${slug}`)
};

export { cartAPI, categoryAPI };
export default instance; 