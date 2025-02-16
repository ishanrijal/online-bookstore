import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import NotificationBox from './common/NotificationBox';
import LoadingBox from './common/LoadingBox';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '', // This will hold either email or username
        password: '',
    });
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Update this useEffect to handle admin redirection
    useEffect(() => {
        if (user) {
            if (user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification({ type: '', message: '' });

        try {
            const response = await axios.post('/users/token/', {
                username: formData.email.trim(),
                password: formData.password
            });

            // Store tokens
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Get user data
            const userResponse = await axios.get('/users/me/', {
                headers: {
                    'Authorization': `Bearer ${response.data.access}`
                }
            });

            // Update auth context with user data and token
            login(userResponse.data, response.data.access);
            
            setNotification({
                type: 'success',
                message: 'Login successful! Redirecting...'
            });

            // Short delay before navigation to show success message
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response?.data?.detail) {
                setNotification({
                    type: 'error',
                    message: error.response.data.detail
                });
            } else if (error.response?.data) {
                const errorMessage = Object.values(error.response.data)[0];
                setNotification({
                    type: 'error',
                    message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
                });
            } else {
                setNotification({
                    type: 'error',
                    message: 'Login failed. Please try again.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="login-page">
                <div className="container">
                    {notification.message && (
                        <NotificationBox
                            type={notification.type}
                            message={notification.message}
                            onClose={() => setNotification({ type: '', message: '' })}
                        />
                    )}

                    <div className="login-wrapper">
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-header">
                                <h2>Login</h2>
                                <p className="subtitle">Welcome back!</p>
                            </div>

                            <div className="form-body">
                                <div className="input-field">
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="email">Email or Username</label>
                                </div>

                                <div className="input-field">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="password">Password</label>
                                </div>
                            </div>

                            <div className="form-footer">
                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <LoadingBox message="Logging in..." />
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Login;