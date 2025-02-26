import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import { FaEye, FaFileInvoice } from 'react-icons/fa';
import './PaymentsList.css';

function PaymentsList() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        payment_method: '',
        date_range: '',
        search: ''
    });

    useEffect(() => {
        fetchPayments();
    }, [filters]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
            
            const response = await axios.get(`/payments/?${queryParams.toString()}`);
            setPayments(response.data);
        } catch (error) {
            showNotification('Failed to fetch payments', 'error');
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

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    if (loading) return <LoadingBox message="Loading payments..." />;

    return (
        <div className="payments-container">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="payments-header">
                <h2>Payment Transactions</h2>
                <div className="filters-container">
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="successful">Successful</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>

                    <select
                        name="payment_method"
                        value={filters.payment_method}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Methods</option>
                        <option value="khalti">Khalti</option>
                        <option value="esewa">eSewa</option>
                        <option value="cash">Cash on Delivery</option>
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
                        placeholder="Search transactions..."
                        className="search-input"
                    />
                </div>
            </div>

            <table className="payments-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id}>
                            <td>{payment.transaction_id}</td>
                            <td>
                                <Link to={`/admin/orders/${payment.order_id}`}>
                                    #{payment.order_number}
                                </Link>
                            </td>
                            <td>{payment.customer_name}</td>
                            <td>Rs. {payment.amount}</td>
                            <td>
                                <span className={`method-badge ${payment.payment_method.toLowerCase()}`}>
                                    {payment.payment_method}
                                </span>
                            </td>
                            <td>
                                <span className={`status-badge ${payment.status.toLowerCase()}`}>
                                    {payment.status}
                                </span>
                            </td>
                            <td>{new Date(payment.created_at).toLocaleString()}</td>
                            <td className="actions">
                                <Link 
                                    to={`/admin/payments/${payment.id}`}
                                    className="btn btn-sm btn-info"
                                    title="View Details"
                                >
                                    <FaEye />
                                </Link>
                                {payment.status === 'SUCCESSFUL' && (
                                    <button
                                        onClick={() => window.open(`/api/payments/${payment.id}/invoice/`, '_blank')}
                                        className="btn btn-sm btn-primary"
                                        title="Download Invoice"
                                    >
                                        <FaFileInvoice />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan="8" className="text-center">
                                No payments found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PaymentsList; 