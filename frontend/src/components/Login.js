import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '', // This will hold either email or username
        password: '',
    });
    const [error, setError] = useState('');
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
        setError('');

        try {
            const tokenResponse = await axios.post(
                'http://127.0.0.1:8000/api/users/token/', 
                {
                    username: formData.email.trim(),
                    password: formData.password
                }
            );

            const { access, refresh } = tokenResponse.data;
            
            const userResponse = await axios.get(
                'http://127.0.0.1:8000/api/users/me/',
                {
                    headers: {
                        'Authorization': `Bearer ${access}`
                    }
                }
            );

            // Just call login - the useEffect will handle navigation
            login(userResponse.data, access);
            
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            
            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else if (error.response?.data) {
                const errorMessage = Object.values(error.response.data)[0];
                setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
            } else {
                setError('Login failed. Please try again.');
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
                    <div className="login-wrapper">
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-header">
                                <h2>Login</h2>
                                <p className="subtitle">Welcome back!</p>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="form-body">
                                <div className="input-field">
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
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
                                    {isLoading ? 'Logging in...' : 'Login'}
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