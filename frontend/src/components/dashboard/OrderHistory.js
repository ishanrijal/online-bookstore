import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import LoaderModal from '../common/LoaderModal';
import NotificationBox from '../common/NotificationBox';
import '../../sass/components/_order-history.sass';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

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
            default:
                return 'badge-secondary';
        }
    };

    if (loading) {
        return <LoaderModal message="Loading orders..." />;
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
                <h2>My Orders</h2>
            </div>

            {orders.length === 0 ? (
                <div className="order-history__empty">
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="order-history__list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card__header">
                                <div className="order-info">
                                    <h3>Order #{order.id}</h3>
                                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                        {order.status_display}
                                    </span>
                                </div>
                                <div className="order-date">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="order-card__items">
                                {order.order_details.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-image">
                                            <img src={item.book_cover} alt={item.book_title} />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.book_title}</h4>
                                            <p className="quantity">Quantity: {item.quantity}</p>
                                            <p className="price">₹{item.price} × {item.quantity}</p>
                                        </div>
                                        <div className="item-total">
                                            ₹{item.subtotal}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-card__footer">
                                <div className="shipping-info">
                                    <h4>Shipping Details</h4>
                                    <p>{order.shipping_address}</p>
                                    <p>{order.contact_number}</p>
                                </div>
                                <div className="order-total">
                                    <span>Total Amount:</span>
                                    <span className="amount">₹{order.total_price}</span>
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