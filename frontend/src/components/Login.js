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
            // Get tokens
            const response = await axios.post('/users/token/', {
                username: formData.email.trim(),
                password: formData.password
            });

            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;

            // Store tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Set token in axios defaults
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Get user data
            const userResponse = await axios.get('/users/me/');
            const userData = userResponse.data;

            // Update auth context
            login(userData, accessToken);
            
            setNotification({
                type: 'success',
                message: 'Login successful! Redirecting...'
            });

            // Check if email is verified and handle navigation
            if (!userData.is_email_verified) {
                try {
                    // Send verification email
                    await axios.post('/users/regenerate_code/', { 
                        email: userData.email 
                    });
                    
                    setNotification({
                        type: 'warning',
                        message: 'Please verify your email. Verification code has been sent.'
                    });
                } catch (emailError) {
                    console.error('Error sending verification email:', emailError);
                    setNotification({
                        type: 'warning',
                        message: 'Please verify your email. Click resend code if you haven\'t received it.'
                    });
                }
                
                setTimeout(() => navigate('/verify-email', { state: { email: userData.email } }), 1500);
                return;
            }

            // Navigate based on role for verified users
            if (userData.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }

        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            setNotification({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const email = prompt('Please enter your email for password reset:');
        if (email) {
            try {
                await axios.post('/users/reset_password/', { email });
                setNotification({ type: 'success', message: 'Password reset email sent. Please check your inbox.' });
            } catch (error) {
                setNotification({ type: 'error', message: 'Error sending password reset email. Please try again.' });
            }
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
                                <button
                                    type="button"
                                    className="btn-link"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot Password?
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