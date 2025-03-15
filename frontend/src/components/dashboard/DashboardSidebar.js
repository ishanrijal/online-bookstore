import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaUser, FaShoppingBag, FaHeart, FaStar, FaShoppingCart, FaBook } from 'react-icons/fa';
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

    // Define menu items based on user role
    const getMenuItems = () => {
        const menuItems = [
            // Common items for all roles
            {
                to: '/dashboard',
                icon: <FaHome className="icon" />,
                text: 'Dashboard',
                roles: ['Reader', 'Author', 'Publisher']
            },
            {
                to: '/dashboard/profile',
                icon: <FaUser className="icon" />,
                text: 'Profile',
                roles: ['Reader', 'Author', 'Publisher']
            },
            {
                to: '/dashboard/reviews',
                icon: <FaStar className="icon" />,
                text: 'My Reviews',
                roles: ['Reader', 'Publisher']
                // roles: ['Reader', 'Author', 'Publisher']
            },
            // Reader-specific items
            {
                to: '/dashboard/orders',
                icon: <FaShoppingBag className="icon" />,
                text: 'My Orders',
                roles: ['Reader']
            },
            {
                to: '/dashboard/wishlist',
                icon: <FaHeart className="icon" />,
                text: 'Wishlist',
                roles: ['Reader']
            },
            {
                to: '/dashboard/cart',
                icon: <FaShoppingCart className="icon" />,
                text: 'My Cart',
                roles: ['Reader']
            },
            // Author/Publisher-specific items
            {
                to: '/dashboard/manage-books',
                icon: <FaBook className="icon" />,
                text: 'Manage Books',
                roles: ['Author', 'Publisher']
            }
        ];

        // Filter items based on user role
        return menuItems.filter(item => item.roles.includes(user?.role));
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
                <p className="user-email">{user.email}</p>
                <p className="user-role">{user.role}</p>
            </div>

            <nav className="dashboard-sidebar__nav">
                <ul>
                    {getMenuItems().map((item, index) => (
                        <li key={index}>
                            <Link to={item.to} className={isActive(item.to.split('/dashboard/')[1] || '')}>
                                {item.icon}
                                {item.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default DashboardSidebar; 