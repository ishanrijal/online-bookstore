import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-main__wrapper">
                    <div className="header-left-wrapper">
                        <Link to="/" className="logo">
                            <span className="site-title">BookPasal</span>
                        </Link>
                        <nav className={`navigation ${isMenuOpen ? 'active' : ''}`}>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/categories">Categories</Link></li>
                                <li><Link to="/about">About</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                            <div className="mobile-auth">
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
                        </nav>
                        <button 
                            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                            onClick={toggleMenu}
                        >
                            <span></span>
                        </button>
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
            </div>
        </header>
    );
};

export default Header;