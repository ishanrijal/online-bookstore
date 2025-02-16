import React from 'react';

function AdminHome() {
    return (
        <div className="admin-home">
            <h2>Welcome to Admin Dashboard</h2>
            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total Books</h3>
                    <p>123</p>
                </div>
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p>45</p>
                </div>
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p>67</p>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p>$12,345</p>
                </div>
            </div>
        </div>
    );
}

export default AdminHome; 