import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
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

export default instance; 