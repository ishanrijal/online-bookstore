import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import LoaderModal from '../common/LoaderModal';
import NotificationBox from '../common/NotificationBox';
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaPhoneAlt, FaTruck, FaDownload } from 'react-icons/fa';
import '../../sass/components/_order-history.sass';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/orders/orders/');
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to load orders'
            });
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'badge-warning';
            case 'PAID':
                return 'badge-success';
            case 'CANCELLED':
                return 'badge-danger';
            case 'DELIVERED':
                return 'badge-info';
            case 'PROCESSING':
                return 'badge-primary';
            default:
                return 'badge-secondary';
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const filteredOrders = () => {
        if (filter === 'all') return orders;
        return orders.filter(order => order.status.toLowerCase() === filter);
    };

    if (loading) {
        return <LoaderModal message="Loading your orders..." />;
    }

    return (
        <div className="order-history">
            {notification.message && (
                <NotificationBox 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <div className="order-history__header">
                <div className="header-title">
                    <FaShoppingBag className="icon" />
                    <h2>My Orders</h2>
                </div>
                <div className="filter-controls">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="order-history__empty">
                    <FaShoppingBag className="empty-icon" />
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                </div>
            ) : (
                <div className="order-history__list">
                    {filteredOrders().map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card__header">
                                <div className="order-info">
                                    <div className="order-number">
                                        <h3>Order #{order.id}</h3>
                                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status_display}
                                        </span>
                                    </div>
                                    <div className="order-date">
                                        <FaCalendarAlt className="icon" />
                                        <span>{formatDate(order.created_at)}</span>
                                    </div>
                                </div>
                                {order.status === 'DELIVERED' && (
                                    <button className="btn-invoice">
                                        <FaDownload className="icon" />
                                        Download Invoice
                                    </button>
                                )}
                            </div>

                            <div className="order-card__items">
                                {order.order_details.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-image">
                                            <img src={item.book_cover || '/default-book-cover.jpg'} alt={item.book_title} />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.book_title}</h4>
                                            <div className="item-meta">
                                                <p className="quantity">
                                                    Quantity: {item.quantity}
                                                </p>
                                                <p className="price">
                                                    Rs.{item.price} × {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="item-total">
                                            <span className="label">Subtotal:</span>
                                            <span className="amount">Rs.{item.subtotal}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-card__footer">
                                <div className="shipping-info">
                                    <h4>
                                        <FaTruck className="icon" />
                                        Delivery Details
                                    </h4>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <FaMapMarkerAlt className="icon" />
                                            <p>{order.shipping_address}</p>
                                        </div>
                                        <div className="info-item">
                                            <FaPhoneAlt className="icon" />
                                            <p>{order.contact_number}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-total">
                                    <div className="total-row">
                                        <span>Items Total:</span>
                                        <span>Rs.{order.total_price}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="total-row grand-total">
                                        <span>Grand Total:</span>
                                        <span>Rs. {order.total_price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory; 