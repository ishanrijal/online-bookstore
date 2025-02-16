import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import Header from './Header';
import Footer from './Footer';
import '../sass/components/_payment-status.sass';

const PaymentFailure = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
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

    const handleRetry = () => {
        navigate('/checkout');
    };

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
            <main className="payment-status payment-status--failure">
                <div className="payment-status__container">
                    <div className="payment-status__icon">
                        <i className="fas fa-times-circle"></i>
                    </div>
                    <h1>Payment Failed</h1>
                    <p>We're sorry, but your payment could not be processed.</p>

                    {payment && (
                        <div className="payment-status__details">
                            <div className="detail-row">
                                <span>Order ID:</span>
                                <span>{payment.order_details.order_id}</span>
                            </div>
                            <div className="detail-row">
                                <span>Amount:</span>
                                <span>₹{payment.payment.amount}</span>
                            </div>
                            <div className="detail-row">
                                <span>Payment Method:</span>
                                <span>{payment.payment.payment_type}</span>
                            </div>
                        </div>
                    )}

                    <div className="payment-status__actions">
                        <button onClick={handleRetry} className="btn btn-primary">
                            Try Again
                        </button>
                        <Link to="/cart" className="btn btn-secondary">
                            Return to Cart
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PaymentFailure; 