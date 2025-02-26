import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    FaHome, 
    FaBook, 
    FaShoppingBag, 
    FaUsers, 
    FaCreditCard, 
    FaStar, 
    FaChevronDown,
    FaPlus,
    FaList,
    FaTags
} from 'react-icons/fa';
import '../../sass/components/_dashboard.sass';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);

    const isActive = (path) => {
        // For admin dashboard overview (root admin path)
        if (path === '') {
            return location.pathname === '/admin' ? 'active' : '';
        }

        // For "Manage Books" - should only be active on exact match
        if (path === 'manage-books') {
            return location.pathname === '/admin/manage-books' ? 'active' : '';
        }

        // For "Add New Book" - should only be active when URL ends with /new
        if (path === 'manage-books/new') {
            return location.pathname === '/admin/manage-books/new' ? 'active' : '';
        }

        // For "Manage Categories" and "Add Category"
        if (path === 'manage-categories') {
            return location.pathname === '/admin/manage-categories' ? 'active' : '';
        }

        if (path === 'manage-categories/new') {
            return location.pathname === '/admin/manage-categories/new' ? 'active' : '';
        }

        // For other menu items
        return location.pathname === `/admin/${path}` ? 'active' : '';
    };

    // Check if any book-related route is active for the parent menu
    const isBookSectionActive = () => {
        return location.pathname.startsWith('/admin/manage-books') || 
               location.pathname.startsWith('/admin/manage-categories') 
               ? 'active' : '';
    };

    const toggleBookMenu = () => {
        setIsBookMenuOpen(!isBookMenuOpen);
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
                <p>Administrator</p>
            </div>

            <nav className="dashboard-sidebar__nav">
                <ul>
                    <li>
                        <Link to="/admin" className={isActive('')}>
                            <FaHome className="icon" />
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <div 
                            className={`submenu-trigger ${isBookMenuOpen ? 'open' : ''} ${isBookSectionActive()}`}
                            onClick={toggleBookMenu}
                        >
                            <FaBook className="icon" />
                            Books Management
                            <FaChevronDown className={`chevron ${isBookMenuOpen ? 'rotate' : ''}`} />
                        </div>
                        <ul className={`submenu ${isBookMenuOpen ? 'show' : ''}`}>
                            <li>
                                <Link to="/admin/manage-books" className={isActive('manage-books')}>
                                    <FaList className="icon" />
                                    Manage Books
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-books/new" className={isActive('manage-books/new')}>
                                    <FaPlus className="icon" />
                                    Add New Book
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-categories" className={isActive('manage-categories')}>
                                    <FaTags className="icon" />
                                    Manage Categories
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/manage-categories/new" className={isActive('manage-categories/new')}>
                                    <FaPlus className="icon" />
                                    Add Category
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <Link to="/admin/manage-orders" className={isActive('manage-orders')}>
                            <FaShoppingBag className="icon" />
                            Manage Orders
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/manage-users" className={isActive('manage-users')}>
                            <FaUsers className="icon" />
                            Manage Users
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/manage-payments" className={isActive('manage-payments')}>
                            <FaCreditCard className="icon" />
                            Manage Payments
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/manage-reviews" className={isActive('manage-reviews')}>
                            <FaStar className="icon" />
                            Manage Reviews
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar; 