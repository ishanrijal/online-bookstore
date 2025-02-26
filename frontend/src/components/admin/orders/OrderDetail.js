import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import LoaderModal from '../../common/LoaderModal';
import { FaArrowLeft, FaMoneyBill, FaEdit } from 'react-icons/fa';
import './OrderDetail.css';

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [editingOrderStatus, setEditingOrderStatus] = useState(false);
    const [editingPaymentStatus, setEditingPaymentStatus] = useState(false);
    const [tempOrderStatus, setTempOrderStatus] = useState('');
    const [tempPaymentStatus, setTempPaymentStatus] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    useEffect(() => {
        if (order) {
            setTempOrderStatus(order.status);
            setTempPaymentStatus(order.payment_status || 'PENDING');
        }
    }, [order]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/orders/orders/${id}/`);
            console.log('Order details:', response.data);

            // Fetch user information
            const userResponse = await axios.get(`/users/${response.data.user}/`);
            
            // Fetch payment information
            let paymentInfo = null;
            try {
                const paymentResponse = await axios.get(`/payments/`);
                paymentInfo = paymentResponse.data.find(p => p.order === parseInt(id));
            } catch (error) {
                console.error('Error fetching payment:', error);
            }

            // Get order details with proper structure
            const orderDetails = response.data.order_details.map(detail => ({
                id: detail.id,
                book_title: detail.book_title,
                book_price: detail.book_price,
                book_cover: detail.book_cover,
                quantity: detail.quantity,
                subtotal: detail.subtotal
            }));

            const orderWithUserAndPayment = {
                ...response.data,
                order_details: orderDetails,
                user: userResponse.data,
                payment_status: paymentInfo?.status || 'PENDING',
                payment_id: paymentInfo?.id,
                payment_type: paymentInfo?.payment_type || 'CASH',
                payment_date: paymentInfo?.created_at
            };

            setOrder(orderWithUserAndPayment);
        } catch (error) {
            console.error('Error fetching order:', error);
            showNotification('Failed to fetch order details: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async () => {
        try {
            setProcessing(true);
            await axios.patch(`/orders/orders/${id}/`, {
                status: tempOrderStatus,
                user: order.user.id
            });
            
            showNotification('Order status updated successfully', 'success');
            setEditingOrderStatus(false);
            
            // Refresh order details
            await fetchOrderDetails();
            
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Failed to update order status: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentStatusChange = async () => {
        try {
            setProcessing(true);
            
            await axios.post(`/payments/`, {
                order: id,
                user: order.user.id,
                amount: order.total_price,
                status: tempPaymentStatus,
                payment_type: 'CASH'
            });
            
            showNotification('Payment status updated successfully', 'success');
            setEditingPaymentStatus(false);
            
            // Refresh order details
            await fetchOrderDetails();
            
        } catch (error) {
            console.error('Error updating payment status:', error);
            showNotification('Failed to update payment status: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setProcessing(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    if (loading) return <div className="dashboard__content"><LoadingBox message="Loading order details..." /></div>;
    if (!order) return <div className="dashboard__content">Order not found</div>;

    // Update the order info card to remove payment status
    const orderInfoCard = (
        <div className="order-info-card">
            <h3>Order Information</h3>
            <div className="info-group">
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <div className="status-group">
                    <strong>Status:</strong>
                    {editingOrderStatus ? (
                        <div className="status-edit-group">
                            <select
                                value={tempOrderStatus}
                                onChange={(e) => setTempOrderStatus(e.target.value)}
                                className="status-select"
                                disabled={processing}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button 
                                onClick={handleStatusChange}
                                className="btn-update"
                                disabled={processing}
                            >
                                Update
                            </button>
                            <button 
                                onClick={() => {
                                    setEditingOrderStatus(false);
                                    setTempOrderStatus(order.status);
                                }}
                                className="btn-cancel"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="status-display">
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                            </span>
                            <button 
                                onClick={() => setEditingOrderStatus(true)}
                                className="btn-edit"
                            >
                                <FaEdit />
                            </button>
                        </div>
                    )}
                </div>
                <p><strong>Total Amount:</strong> Rs. {order.total_price}</p>
            </div>
        </div>
    );

    // Update the order items table
    const orderItemsTable = (
        <div className="order-info-card full-width">
            <h3>Order Items</h3>
            <table className="items-table">
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.order_details && order.order_details.map((item, index) => (
                        <tr key={item.id || index}>
                            <td>
                                <div className="book-info">
                                    <img 
                                        src={item.book_cover || '/placeholder-book.png'} 
                                        alt={item.book_title} 
                                        onError={(e) => e.target.src = '/placeholder-book.png'}
                                    />
                                    <div>
                                        <h4>{item.book_title}</h4>
                                    </div>
                                </div>
                            </td>
                            <td>Rs. {item.book_price}</td>
                            <td>{item.quantity}</td>
                            <td>Rs. {item.subtotal}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                        <td>Rs. {order.total_price}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );

    return (
        <div className="dashboard__content">
            <div className="orders-container">
                {notification && (
                    <NotificationBox
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
                {processing && <LoaderModal message="Processing..." />}

                <div className="order-detail">
                    <div className="order-detail__header">
                        <button 
                            onClick={() => navigate('/admin/manage-orders')}
                            className="back-button"
                        >
                            <FaArrowLeft /> Back to Orders
                        </button>
                        <h2>Order #{order.id}</h2>
                        {order.payment_status === 'COMPLETED' && (
                            <button 
                                onClick={() => navigate(`/admin/payments/${order.payment_id}`)}
                                className="payment-button"
                            >
                                <FaMoneyBill /> View Payment
                            </button>
                        )}
                    </div>

                    <div className="order-detail__grid">
                        {orderInfoCard}
                        
                        <div className="order-info-card">
                            <h3>Payment Information</h3>
                            <div className="info-group">
                                <div className="status-group">
                                    <strong>Payment Status:</strong>
                                    {editingPaymentStatus ? (
                                        <div className="status-edit-group">
                                            <select
                                                value={tempPaymentStatus}
                                                onChange={(e) => setTempPaymentStatus(e.target.value)}
                                                className="status-select"
                                                disabled={processing}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="FAILED">Failed</option>
                                            </select>
                                            <button 
                                                onClick={handlePaymentStatusChange}
                                                className="btn-update"
                                                disabled={processing}
                                            >
                                                Update
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingPaymentStatus(false);
                                                    setTempPaymentStatus(order.payment_status || 'PENDING');
                                                }}
                                                className="btn-cancel"
                                                disabled={processing}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="status-display">
                                            <span className={`payment-badge ${(order.payment_status || 'PENDING').toLowerCase()}`}>
                                                {(order.payment_status || 'PENDING').toUpperCase()}
                                            </span>
                                            <button 
                                                onClick={() => setEditingPaymentStatus(true)}
                                                className="btn-edit"
                                            >
                                                <FaEdit />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p><strong>Payment Type:</strong> {order.payment_type || 'CASH'}</p>
                                <p><strong>Payment Date:</strong> {order.payment_date ? new Date(order.payment_date).toLocaleString() : 'Not paid yet'}</p>
                                <p><strong>Amount:</strong> Rs. {order.total_price}</p>
                            </div>
                        </div>

                        <div className="order-info-card">
                            <h3>Customer Information</h3>
                            <div className="info-group">
                                <p><strong>Name:</strong> {`${order.user.first_name || ''} ${order.user.last_name || ''}`}</p>
                                <p><strong>User ID:</strong> {order.user.id}</p>
                                <p><strong>Phone:</strong> {order.contact_number || 'Not provided'}</p>
                                <p><strong>Email:</strong> {order.user.email || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="order-info-card">
                            <h3>Shipping Address</h3>
                            <div className="info-group">
                                <p>{order.shipping_address}</p>
                            </div>
                        </div>

                        {orderItemsTable}

                        {order.notes && (
                            <div className="order-info-card full-width">
                                <h3>Order Notes</h3>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetail;
