import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { FaBook, FaShoppingBag, FaUsers, FaComments } from 'react-icons/fa';
import NotificationBox from '../common/NotificationBox';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalReviews: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [booksRes, ordersRes, usersRes, reviewsRes] = await Promise.all([
                axios.get('/books/'),
                axios.get('/orders/'),
                axios.get('/users/'),
                axios.get('/reviews/')
            ]);

            setStats({
                totalBooks: booksRes.data.length,
                totalOrders: ordersRes.data.length,
                totalUsers: usersRes.data.length,
                totalReviews: reviewsRes.data.length
            });

            setRecentOrders(ordersRes.data.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setNotification({
                type: 'error',
                message: 'Failed to load dashboard data'
            });
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="dashboard-overview">
            {notification.message && (
                <NotificationBox 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <h2>Dashboard Overview</h2>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaBook />
                    </div>
                    <div className="stat-details">
                        <h3>Total Books</h3>
                        <p>{stats.totalBooks}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaShoppingBag />
                    </div>
                    <div className="stat-details">
                        <h3>Total Orders</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-details">
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaComments />
                    </div>
                    <div className="stat-details">
                        <h3>Total Reviews</h3>
                        <p>{stats.totalReviews}</p>
                    </div>
                </div>
            </div>

            <div className="recent-orders">
                <div className="recent-orders__header">
                    <h3>Recent Orders</h3>
                    <Link to="/admin/manage-orders" className="view-all">
                        View All Orders
                    </Link>
                </div>
                
                {recentOrders.length === 0 ? (
                    <div className="no-orders">
                        <p>No orders found</p>
                    </div>
                ) : (
                    <div className="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.user.username}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status status--${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="amount">
                                            <span className="currency">R.S</span>
                                            {order.total_price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOverview; 