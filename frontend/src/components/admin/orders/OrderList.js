import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import LoaderModal from '../../common/LoaderModal';
import { FaEye, FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './ManageOrders.css';

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        date_range: '',
        search: ''
    });
    const [sort, setSort] = useState({
        field: 'created_at',
        direction: 'desc'
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/orders/orders/');
            console.log('Orders API Response:', response.data);
            
            let ordersData;
            if (response.data && response.data.results) {
                ordersData = response.data.results;
            } else if (Array.isArray(response.data)) {
                ordersData = response.data;
            } else {
                console.error('Unexpected response format:', response.data);
                ordersData = [];
            }

            // Fetch user information for each order
            const ordersWithUserInfo = await Promise.all(
                ordersData.map(async (order) => {
                    try {
                        const userResponse = await axios.get(`/users/${order.user}/`);
                        return {
                            ...order,
                            user: userResponse.data
                        };
                    } catch (error) {
                        console.error(`Error fetching user info for order ${order.id}:`, error);
                        return {
                            ...order,
                            user: {
                                id: order.user,
                                first_name: 'Unknown',
                                last_name: 'User',
                                username: 'unknown'
                            }
                        };
                    }
                })
            );
            
            console.log('Orders with user info:', ordersWithUserInfo);
            setOrders(ordersWithUserInfo);
        } catch (error) {
            console.error('Error fetching orders:', error.response || error);
            showNotification('Failed to fetch orders: ' + (error.response?.data?.message || error.message), 'error');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSort = (field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (field) => {
        if (sort.field !== field) return <FaSort className="sort-icon" />;
        return sort.direction === 'asc' ? 
            <FaSortUp className="sort-icon active" /> : 
            <FaSortDown className="sort-icon active" />;
    };

    const handleOrderAction = async (orderId, action) => {
        try {
            setProcessing(true);
            const statusMap = {
                'confirm': 'Processing',
                'ship': 'Shipped',
                'deliver': 'Delivered',
                'cancel': 'Cancelled'
            };

            // First update the order status
            await axios.patch(`/orders/orders/${orderId}/`, {
                status: statusMap[action]
            });

            // If confirming the order and payment is pending, update payment status
            if (action === 'confirm') {
                await axios.patch(`/payments/update-status/${orderId}/`, {
                    status: 'PENDING'
                });
            }
            
            showNotification(`Order ${action}ed successfully`, 'success');
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            console.error('Error performing action:', error);
            const errorMessage = error.response?.data?.message || `Failed to ${action} order`;
            showNotification(errorMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const filteredAndSortedOrders = () => {
        let result = [...orders];

        // Apply status filter
        if (filters.status) {
            result = result.filter(order => order.status === filters.status);
        }

        // Apply payment status filter
        if (filters.payment_status) {
            result = result.filter(order => order.payment_status === filters.payment_status);
        }

        // Apply date range filter
        if (filters.date_range) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            switch (filters.date_range) {
                case 'today':
                    result = result.filter(order => new Date(order.created_at) >= today);
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    result = result.filter(order => new Date(order.created_at) >= weekAgo);
                    break;
                case 'month':
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    result = result.filter(order => new Date(order.created_at) >= monthAgo);
                    break;
                default:
                    break;
            }
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(order => 
                order.id.toString().includes(searchLower) ||
                `${order.user.first_name} ${order.user.last_name}`.toLowerCase().includes(searchLower) ||
                order.contact_number?.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let compareA = a[sort.field];
            let compareB = b[sort.field];

            // Handle special cases
            if (sort.field === 'user__first_name') {
                compareA = `${a.user.first_name} ${a.user.last_name}`;
                compareB = `${b.user.first_name} ${b.user.last_name}`;
            }

            if (typeof compareA === 'string') {
                return sort.direction === 'asc'
                    ? compareA.localeCompare(compareB)
                    : compareB.localeCompare(compareA);
            }

            if (sort.field === 'created_at') {
                return sort.direction === 'asc'
                    ? new Date(compareA) - new Date(compareB)
                    : new Date(compareB) - new Date(compareA);
            }

            return sort.direction === 'asc'
                ? compareA - compareB
                : compareB - compareA;
        });

        return result;
    };

    if (loading) return <LoadingBox message="Loading orders..." />;

    return (
        <div className="orders-container">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {processing && <LoaderModal message="Processing..." />}

            <div className="orders-header">
                <h2>All Orders</h2>
                <div className="filters-container">
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        name="payment_status"
                        value={filters.payment_status}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Payments</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>

                    <select
                        name="date_range"
                        value={filters.date_range}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by order number or customer..."
                        className="search-input"
                    />
                </div>
            </div>

            <table className="orders-table">
                <thead>
                    <tr>
                        <th className="sortable" onClick={() => handleSort('id')}>
                            Order ID {getSortIcon('id')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('user__first_name')}>
                            Customer {getSortIcon('user__first_name')}
                        </th>
                        <th>Contact</th>
                        <th className="sortable" onClick={() => handleSort('created_at')}>
                            Date {getSortIcon('created_at')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('total_price')}>
                            Total {getSortIcon('total_price')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('status')}>
                            Order Status {getSortIcon('status')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('payment_status')}>
                            Payment Status {getSortIcon('payment_status')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedOrders().length > 0 ? (
                        filteredAndSortedOrders().map(order => (
                            <tr key={order.id}>
                                <td>
                                    <Link to={`/admin/manage-orders/${order.id}`} className="order-link">
                                        #{order.id}
                                    </Link>
                                </td>
                                <td>
                                    <div className="customer-info">
                                        <span>
                                            {`${order.user.first_name || ''} ${order.user.last_name || ''}`}
                                        </span>
                                    </div>
                                </td>
                                <td>{order.contact_number}</td>
                                <td>{new Date(order.created_at).toLocaleString()}</td>
                                <td>Rs. {order.total_price}</td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`payment-badge ${order.payment_status?.toLowerCase()}`}>
                                        {order.payment_status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No orders found matching the filters
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default OrderList; 