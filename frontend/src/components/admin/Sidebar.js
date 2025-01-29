import React from 'react';
import { Link } from 'react-router-dom';
import './admin.css'; // Optional: Create a CSS file for styling

function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Admin Menu</h2>
            <ul>
                <li><Link to="/admin/manage-books">Manage Books</Link></li>
                <li><Link to="/admin/manage-orders">Manage Orders</Link></li>
                <li><Link to="/admin/manage-users">Manage Users</Link></li>
                <li><Link to="/admin/manage-payments">Manage Payments</Link></li>
                <li><Link to="/admin/manage-reviews">Manage Reviews</Link></li>
            </ul>
        </div>
    );
}

export default Sidebar; 