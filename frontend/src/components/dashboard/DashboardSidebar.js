import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../sass/components/_dashboard.sass';

const DashboardSidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => {
        return location.pathname.includes(path) ? 'active' : '';
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
                        <Link to="/dashboard/profile" className={isActive('profile')}>
                            <i className="fas fa-user"></i>
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/orders" className={isActive('orders')}>
                            <i className="fas fa-shopping-bag"></i>
                            My Orders
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/wishlist" className={isActive('wishlist')}>
                            <i className="fas fa-heart"></i>
                            Wishlist
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/reviews" className={isActive('reviews')}>
                            <i className="fas fa-star"></i>
                            My Reviews
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/settings" className={isActive('settings')}>
                            <i className="fas fa-cog"></i>
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default DashboardSidebar; 