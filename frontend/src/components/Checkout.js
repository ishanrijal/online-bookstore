import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import Header from './Header';
import Footer from './Footer';
import LoaderModal from './common/LoaderModal';
import NotificationBox from './common/NotificationBox';
import '../sass/components/_checkout.sass';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [shippingDetails, setShippingDetails] = useState({
        address: '',
        contact_number: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        if (!orderSuccess) {
            fetchCart();
        }
    }, [orderSuccess]);

    const fetchCart = async () => {
        try {
            const response = await axios.get('/orders/carts/current/');
            if (!response.data.items?.length) {
                navigate('/cart');
                return;
            }
            setCart(response.data);
            setLoading(false);
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Failed to load cart details'
            });
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleCheckout = async () => {
        if (!shippingDetails.address || !shippingDetails.contact_number) {
            setNotification({
                type: 'error',
                message: 'Please fill in all shipping details'
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Create order first
            const orderResponse = await axios.post('/orders/orders/', {
                shipping_address: shippingDetails.address,
                contact_number: shippingDetails.contact_number
            });

            // Then create payment
            const paymentResponse = await axios.post('/payments/', {
                order: orderResponse.data.id,
                payment_type: paymentMethod,
            });

            if (paymentResponse.data.status === 'PENDING' || paymentResponse.data.status === 'COMPLETED') {
                switch (paymentMethod) {
                    case 'CASH':
                        setCart(null);
                        setOrderSuccess(true);
                        setNotification({
                            type: 'success',
                            message: 'Order placed successfully!'
                        });
                        break;
                    
                    case 'KHALTI':
                        const khaltiConfig = {
                            publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
                            productIdentity: orderResponse.data.id,
                            productName: "Book Order",
                            productUrl: "http://localhost:3000",
                            eventHandler: {
                                onSuccess: async (payload) => {
                                    await axios.post(`/payments/${paymentResponse.data.id}/verify_khalti/`, payload);
                                    setOrderSuccess(true);
                                    setNotification({
                                        type: 'success',
                                        message: 'Order placed successfully!'
                                    });
                                },
                                onError: (error) => {
                                    navigate(`/payment/failure/${paymentResponse.data.id}`);
                                },
                                onClose: () => {
                                    console.log('Khalti widget closed');
                                }
                            },
                            amount: cart.total_price * 100 // Convert to paisa
                        };
                        
                        const checkout = new window.KhaltiCheckout(khaltiConfig);
                        checkout.show({ amount: cart.total_price * 100 });
                        break;
                    
                    case 'ESEWA':
                        // Initialize eSewa payment form
                        const form = document.createElement('form');
                        form.setAttribute('method', 'POST');
                        form.setAttribute('action', 'https://uat.esewa.com.np/epay/main');
                        
                        const params = {
                            amt: cart.total_price,
                            psc: 0,
                            pdc: 0,
                            txAmt: 0,
                            tAmt: cart.total_price,
                            pid: orderResponse.data.id,
                            scd: process.env.REACT_APP_ESEWA_MERCHANT_CODE,
                            su: `${window.location.origin}/payment/success/${paymentResponse.data.id}`,
                            fu: `${window.location.origin}/payment/failure/${paymentResponse.data.id}`
                        };
                        
                        Object.keys(params).forEach(key => {
                            const input = document.createElement('input');
                            input.setAttribute('type', 'hidden');
                            input.setAttribute('name', key);
                            input.setAttribute('value', params[key]);
                            form.appendChild(input);
                        });
                        
                        document.body.appendChild(form);
                        form.submit();
                        break;
                    
                    default:
                        setNotification({
                            type: 'error',
                            message: 'Invalid payment method'
                        });
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to process order'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading && !orderSuccess) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="checkout">
                {notification.message && (
                    <NotificationBox 
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification({ type: '', message: '' })}
                    />
                )}

                {isProcessing && (
                    <LoaderModal message="Processing your order..." />
                )}

                {orderSuccess ? (
                    <div className="checkout__success">
                        <div className="success-content">
                            <div className="success-icon">✓</div>
                            <h2>Order Placed Successfully!</h2>
                            <p>Thank you for your order. We'll process it right away.</p>
                            <Link to="/" className="continue-shopping-btn">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="checkout__container">
                        <h1>Checkout</h1>

                        <div className="checkout__content">
                            <div className="checkout__shipping">
                                <h2>Shipping Details</h2>
                                <div className="form-group">
                                    <label htmlFor="address">Delivery Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={shippingDetails.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact_number">Contact Number</label>
                                    <input
                                        type="tel"
                                        id="contact_number"
                                        name="contact_number"
                                        value={shippingDetails.contact_number}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="checkout__payment">
                                <h2>Payment Method</h2>
                                <div className="payment-methods">
                                    <div className="payment-method">
                                        <input
                                            type="radio"
                                            id="cash"
                                            name="payment_method"
                                            value="CASH"
                                            checked={paymentMethod === 'CASH'}
                                            onChange={handlePaymentMethodChange}
                                        />
                                        <label htmlFor="cash">Cash on Delivery</label>
                                    </div>
                                    <div className="payment-method">
                                        <input
                                            type="radio"
                                            id="khalti"
                                            name="payment_method"
                                            value="KHALTI"
                                            checked={paymentMethod === 'KHALTI'}
                                            onChange={handlePaymentMethodChange}
                                        />
                                        <label htmlFor="khalti">Khalti</label>
                                    </div>
                                    <div className="payment-method">
                                        <input
                                            type="radio"
                                            id="esewa"
                                            name="payment_method"
                                            value="ESEWA"
                                            checked={paymentMethod === 'ESEWA'}
                                            onChange={handlePaymentMethodChange}
                                        />
                                        <label htmlFor="esewa">eSewa</label>
                                    </div>
                                </div>
                            </div>

                            <div className="checkout__summary">
                                <h2>Order Summary</h2>
                                <div className="summary-items">
                                    {cart.items.map(item => (
                                        <div key={item.id} className="summary-item">
                                            <span>{item.book_title} × {item.quantity}</span>
                                            <span>₹{item.subtotal}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="summary-total">
                                    <span>Total Amount:</span>
                                    <span>₹{cart.total_price}</span>
                                </div>
                                <button 
                                    className="btn btn-primary place-order-btn"
                                    onClick={handleCheckout}
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Checkout; 