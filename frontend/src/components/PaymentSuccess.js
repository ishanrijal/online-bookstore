import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import Header from './Header';
import Footer from './Footer';
import '../sass/components/_payment-status.sass';

const PaymentSuccess = () => {
    const { paymentId } = useParams();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                const response = await axios.get(`/payments/${paymentId}/payment_details/`);
                setPayment(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payment details:', error);
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [paymentId]);

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="payment-status payment-status--success">
                <div className="payment-status__container">
                    <div className="payment-status__icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h1>Payment Successful!</h1>
                    <p>Thank you for your order.</p>

                    {payment && (
                        <div className="payment-status__details">
                            <div className="detail-row">
                                <span>Order ID:</span>
                                <span>{payment.order_details.order_id}</span>
                            </div>
                            <div className="detail-row">
                                <span>Amount Paid:</span>
                                <span>₹{payment.payment.amount}</span>
                            </div>
                            <div className="detail-row">
                                <span>Payment Method:</span>
                                <span>{payment.payment.payment_type}</span>
                            </div>
                            <div className="detail-row">
                                <span>Transaction ID:</span>
                                <span>{payment.payment.transaction_id || 'N/A'}</span>
                            </div>
                        </div>
                    )}

                    <div className="payment-status__actions">
                        <Link to="/dashboard" className="btn btn-primary">
                            View Orders
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PaymentSuccess; 