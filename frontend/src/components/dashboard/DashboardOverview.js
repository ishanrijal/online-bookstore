import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { FaShoppingBag, FaComments, FaHeart, FaBox, FaTimes } from 'react-icons/fa';
import NotificationBox from '../common/NotificationBox';

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalReviews: 0,
        wishlistItems: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [ordersRes, reviewsRes] = await Promise.all([
                axios.get('/orders/orders/'),
                axios.get('/reviews/reviews/')
            ]);

            const orders = ordersRes.data;
            const reviews = reviewsRes.data;

            setStats({
                totalOrders: orders.length,
                totalReviews: reviews.length,
                wishlistItems: 0,
                pendingOrders: orders.filter(order => order.status === 'PENDING').length
            });

            const sortedOrders = orders.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            setRecentOrders(sortedOrders.slice(0, 3));
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

    const handleCancelOrder = async (orderId) => {
        try {
            await axios.post(`/orders/orders/${orderId}/cancel/`);
            setNotification({
                type: 'success',
                message: 'Order cancelled successfully'
            });
            fetchDashboardData();
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.error || 'Failed to cancel order'
            });
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'status--pending';
            case 'PAID':
                return 'status--delivered';
            case 'CANCELLED':
                return 'status--cancelled';
            default:
                return 'status--processing';
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
                        <FaShoppingBag />
                    </div>
                    <div className="stat-details">
                        <h3>Total Orders</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaBox />
                    </div>
                    <div className="stat-details">
                        <h3>Pending Orders</h3>
                        <p>{stats.pendingOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaComments />
                    </div>
                    <div className="stat-details">
                        <h3>Reviews</h3>
                        <p>{stats.totalReviews}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaHeart />
                    </div>
                    <div className="stat-details">
                        <h3>Wishlist</h3>
                        <p>{stats.wishlistItems}</p>
                    </div>
                </div>
            </div>

            <div className="recent-orders">
                <div className="recent-orders__header">
                    <h3>Recent Orders</h3>
                    <Link to="/dashboard/orders" className="view-all">
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
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link to={`/dashboard/orders/`}>
                                                #{order.id}
                                            </Link>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status ${getStatusBadgeClass(order.status)}`}>
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

export default DashboardOverview; 