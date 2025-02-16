import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import '../sass/layouts/_header.sass';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cartItemsCount, setCartItemsCount] = useState(0);

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const response = await axios.get('/orders/carts/current/');
                setCartItemsCount(response.data.items_count || 0);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };

        if (user) {
            fetchCartCount();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-left-wrapper">
                    <Link to="/" className="logo">
                        <img src="/logo.png" alt="BookPasal" />
                        <span className="site-title">BookPasal</span>
                    </Link>
                    <nav className="navigation">
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            {user && (
                                <>
                                    <li><Link to="/dashboard">Dashboard</Link></li>
                                    {cartItemsCount > 0 && (
                                        <li>
                                            <Link to="/cart" className="cart-link">
                                                Cart ({cartItemsCount})
                                            </Link>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                    </nav>
                </div>

                <div className="header-right">
                    {user ? (
                        <div className="user-menu">
                            {user.role === 'Admin' ? (
                                <Link to="/admin" className="dashboard-btn">Admin Dashboard</Link>
                            ) : (
                                <Link to="/dashboard" className="dashboard-btn">Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register" className="register-btn">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;