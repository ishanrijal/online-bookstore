import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import axios, { wishlistAPI } from '../utils/axios';
import { FaShoppingCart, FaHeart, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { wishlistCount, updateWishlistCount } = useWishlist();
    const navigate = useNavigate();
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                if (user && user.role === 'Reader') {
                    const [cartRes, wishlistRes] = await Promise.all([
                        axios.get('/orders/carts/current/'),
                        wishlistAPI.getWishlist()
                    ]);
                    setCartItemsCount(cartRes.data.items_count || 0);
                    updateWishlistCount(wishlistRes.data.length || 0);
                }
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, [user, updateWishlistCount]);

    const handleLogout = () => {
        logout();
        updateWishlistCount(0);
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="container">
                {/* Top Header */}
                <div className="header-top">
                    <Link to="/" className="logo">
                        <span className="site-title">BookPasal</span>
                    </Link>
                    
                    {user ? (
                        <div className="user-actions">
                            <Link to={user.role === 'Admin' ? "/admin" : "/dashboard"} 
                                  className="dashboard-btn">
                                {user.role === 'Admin' ? 'Admin' : 'Dashboard'}
                            </Link>
                            <button onClick={handleLogout} className="logout-btn desktop-only">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register" className="register-btn desktop-only">Register</Link>
                        </div>
                    )}
                </div>

                {/* Bottom Header */}
                <div className="header-bottom">
                    <div className="header-bottom-left">
                        <button className="menu-toggle" onClick={toggleMenu}>
                            <FaBars className="menu-icon" />
                        </button>
                        <nav className={`navigation ${isMenuOpen ? 'active' : ''}`}>
                            <div className="nav-header">
                                <span className="nav-title">Menu</span>
                                <button className="nav-close" onClick={toggleMenu}>
                                    <FaTimes className="close-icon" />
                                </button>
                            </div>
                            <ul>
                                <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
                                <li><Link to="/categories" onClick={toggleMenu}>Categories</Link></li>
                                <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
                                <li><Link to="/contact" onClick={toggleMenu}>Contact</Link></li>
                                {user && (
                                    <li className="mobile-only">
                                        <button onClick={() => {
                                            toggleMenu();
                                            handleLogout();
                                        }} className="mobile-logout">
                                            Logout
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </div>

                    {user && user.role === 'Reader' && (
                        <div className="header-shop-actions">
                            <Link to="/dashboard/wishlist" className="shop-icon-button wishlist-icon">
                                <FaHeart className="action-icon" />
                                <span className="shop-count wishlist-count">{wishlistCount}</span>
                            </Link>
                            <Link to="/dashboard/cart" className="shop-icon-button cart-icon">
                                <FaShoppingCart className="action-icon" />
                                <span className="shop-count cart-count">{cartItemsCount}</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;