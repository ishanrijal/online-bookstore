import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaUser, FaShoppingBag, FaHeart, FaStar, FaCog } from 'react-icons/fa';
import '../../sass/components/_dashboard.sass';

const DashboardSidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => {
        // For dashboard overview (root dashboard path)
        if (path === '') {
            return location.pathname === '/dashboard' ? 'active' : '';
        }
        // For other routes
        return location.pathname.includes(`/dashboard/${path}`) ? 'active' : '';
    };

    return (
        <div className="dashboard-sidebar">
            <div className="dashboard-sidebar__profile">
                <div className="profile-avatar">
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.username} />
                    ) : (
                        <div className="avatar-placeholder">
                            {user.first_name?.charAt(0) || user.username.charAt(0)}
                        </div>
                    )}
                </div>
                <h3>{user.first_name || user.username}</h3>
                <p>{user.email}</p>
            </div>

            <nav className="dashboard-sidebar__nav">
                <ul>
                    <li>
                        <Link to="/dashboard" className={isActive('')}>
                            <FaHome className="icon" />
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/profile" className={isActive('profile')}>
                            <FaUser className="icon" />
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/orders" className={isActive('orders')}>
                            <FaShoppingBag className="icon" />
                            My Orders
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/wishlist" className={isActive('wishlist')}>
                            <FaHeart className="icon" />
                            Wishlist
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/reviews" className={isActive('reviews')}>
                            <FaStar className="icon" />
                            My Reviews
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/settings" className={isActive('settings')}>
                            <FaCog className="icon" />
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default DashboardSidebar; 