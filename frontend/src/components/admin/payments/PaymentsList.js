import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import { FaSearch, FaFilter, FaSort, FaEye } from 'react-icons/fa';
import './Payments.css';

function PaymentsList() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        fetchPayments();
    }, [filterStatus, sortField, sortDirection]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/payments/', {
                params: {
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    sort_by: sortField,
                    sort_direction: sortDirection
                }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            showNotification('Failed to fetch payments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const filteredPayments = payments.filter(payment => {
        const searchMatch = 
            payment.order_id?.toString().includes(searchTerm) ||
            payment.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.amount?.toString().includes(searchTerm);
        
        const statusMatch = filterStatus === 'all' || payment.status === filterStatus;
        
        return searchMatch && statusMatch;
    });

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
                <h2>Manage Payments</h2>
            </div>

            <div className="payments-controls">
                <div className="search-box">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-box">
                    <div className="filter-select-wrapper">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="status-select"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="payments-table-container">
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>
                                Payment ID
                                {sortField === 'id' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('order')}>
                                Order ID
                                {sortField === 'order' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('amount')}>
                                Amount
                                {sortField === 'amount' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('status')}>
                                Status
                                {sortField === 'status' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('payment_type')}>
                                Payment Type
                                {sortField === 'payment_type' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('created_at')}>
                                Date
                                {sortField === 'created_at' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No payments found
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
                                    <td>#{payment.order}</td>
                                    <td>Rs. {payment.amount}</td>
                                    <td>
                                        <span className={`payment-badge ${payment.status.toLowerCase()}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>{payment.payment_type}</td>
                                    <td>{new Date(payment.created_at).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`/admin/manage-payments/${payment.id}`)}
                                            title="View Payment Details"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PaymentsList; 