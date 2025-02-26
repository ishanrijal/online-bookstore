import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import { FaArrowLeft, FaFileInvoice, FaEdit } from 'react-icons/fa';
import './Payments.css';

function PaymentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [editingStatus, setEditingStatus] = useState(false);
    const [tempStatus, setTempStatus] = useState('');

    useEffect(() => {
        fetchPaymentDetails();
    }, [id]);

    const fetchPaymentDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/payments/${id}/`);
            
            // Fetch order details
            const orderResponse = await axios.get(`/orders/orders/${response.data.order}/`);
            
            // Fetch user details
            const userResponse = await axios.get(`/users/${response.data.user}/`);

            const paymentWithDetails = {
                ...response.data,
                order_details: orderResponse.data,
                user_details: userResponse.data
            };

            setPayment(paymentWithDetails);
            setTempStatus(paymentWithDetails.status);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            showNotification('Failed to fetch payment details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await axios.patch(`/payments/${id}/`, {
                status: tempStatus
            });
            
            showNotification('Payment status updated successfully', 'success');
            setEditingStatus(false);
            await fetchPaymentDetails();
        } catch (error) {
            console.error('Error updating payment status:', error);
            showNotification('Failed to update payment status', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    if (loading) return <div className="dashboard__content"><LoadingBox message="Loading payment details..." /></div>;
    if (!payment) return <div className="dashboard__content">Payment not found</div>;

    return (
        <div className="dashboard__content">
            <div className="payment-detail-container">
                {notification && (
                    <NotificationBox
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}

                <div className="payment-detail">
                    <div className="payment-detail__header">
                        <button 
                            onClick={() => navigate('/admin/manage-payments')}
                            className="back-button"
                        >
                            <FaArrowLeft /> Back to Payments
                        </button>
                        <h2>Payment #{payment.id}</h2>
                        <button 
                            onClick={() => window.open(`/admin/manage-orders/${payment.order}`, '_blank')}
                            className="view-order-button"
                        >
                            <FaFileInvoice /> View Order
                        </button>
                    </div>

                    <div className="payment-detail__grid">
                        <div className="payment-info-card">
                            <h3>Payment Information</h3>
                            <div className="info-group">
                                <div className="status-group">
                                    <strong>Status:</strong>
                                    {editingStatus ? (
                                        <div className="status-edit-group">
                                            <select
                                                value={tempStatus}
                                                onChange={(e) => setTempStatus(e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="FAILED">Failed</option>
                                            </select>
                                            <button 
                                                onClick={handleStatusUpdate}
                                                className="btn-update"
                                            >
                                                Update
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingStatus(false);
                                                    setTempStatus(payment.status);
                                                }}
                                                className="btn-cancel"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="status-display">
                                            <span className={`payment-badge ${payment.status.toLowerCase()}`}>
                                                {payment.status}
                                            </span>
                                            <button 
                                                onClick={() => setEditingStatus(true)}
                                                className="btn-edit"
                                            >
                                                <FaEdit />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p><strong>Amount:</strong> Rs. {payment.amount}</p>
                                <p><strong>Payment Type:</strong> {payment.payment_type}</p>
                                <p><strong>Transaction ID:</strong> {payment.transaction_id || 'N/A'}</p>
                                <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="payment-info-card">
                            <h3>Order Information</h3>
                            <div className="info-group">
                                <p><strong>Order ID:</strong> #{payment.order}</p>
                                <p><strong>Order Status:</strong> {payment.order_details.status}</p>
                                <p><strong>Order Date:</strong> {new Date(payment.order_details.created_at).toLocaleString()}</p>
                                <p><strong>Total Items:</strong> {payment.order_details.order_details?.length || 0}</p>
                            </div>
                        </div>

                        <div className="payment-info-card">
                            <h3>Customer Information</h3>
                            <div className="info-group">
                                <p><strong>Name:</strong> {`${payment.user_details.first_name || ''} ${payment.user_details.last_name || ''}`}</p>
                                <p><strong>Email:</strong> {payment.user_details.email}</p>
                                <p><strong>Phone:</strong> {payment.order_details.contact_number || 'Not provided'}</p>
                            </div>
                        </div>

                        {payment.notes && (
                            <div className="payment-info-card full-width">
                                <h3>Payment Notes</h3>
                                <p>{payment.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentDetail; 