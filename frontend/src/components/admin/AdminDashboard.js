import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import './admin.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-left">
                    <h1>Admin Dashboard</h1>
                </div>
                <div className="header-right">
                    <div className="profile-section">
                        <div 
                            className="profile-trigger"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="profile-avatar">
                                {user.profile_picture ? (
                                    <img 
                                        src={user.profile_picture} 
                                        alt={user.username}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.first_name?.charAt(0) || user.username.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="profile-name">{user.first_name || user.username}</span>
                        </div>
                        
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <ul>
                                    <li onClick={() => navigate('/admin/profile')}>
                                        Profile Settings
                                    </li>
                                    <li onClick={handleLogout}>
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <div className="admin-content">
                <div className="admin-sidebar">
                    <h2>Admin Menu</h2>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/admin/manage-books">Manage Books</Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-orders">Manage Orders</Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-users">Manage Users</Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-payments">Manage Payments</Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-reviews">Manage Reviews</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard; 