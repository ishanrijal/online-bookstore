import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './admin.css'; // Optional: Create a CSS file for styling

function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <Header />
            <div className="admin-content">
                <Sidebar />
                <div className="main-content">
                    <Outlet /> {/* This will render the selected component */}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard; 