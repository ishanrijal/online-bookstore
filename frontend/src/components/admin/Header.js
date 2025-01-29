import React from 'react';
import './admin.css'; // Optional: Create a CSS file for styling

function Header() {
    return (
        <div className="header">
            <h1>Admin Dashboard</h1>
            <div className="profile">
                <span className="profile-name">John Doe</span>
                <span className="profile-role">Admin</span>
                <img src="path/to/profile-icon.png" alt="Profile" className="profile-icon" />
            </div>
        </div>
    );
}

export default Header; 