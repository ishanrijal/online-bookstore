import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-left-wrapper">
                <Link to="/" className="logo">
                    <h1>BookPasal</h1>
                </Link>

                <nav className="navigation">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/categories">Categories</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
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
        </header>
    );
}

export default Header;