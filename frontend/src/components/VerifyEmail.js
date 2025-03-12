import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

const VerifyEmail = () => {
    const [code, setCode] = useState('');
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [countdown, setCountdown] = useState(() => {
        const savedCountdown = localStorage.getItem('verificationCountdown');
        const savedTimestamp = localStorage.getItem('verificationTimestamp');
        
        if (savedCountdown && savedTimestamp) {
            const elapsedSeconds = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
            const remainingTime = Math.max(0, parseInt(savedCountdown) - elapsedSeconds);
            return remainingTime > 0 ? remainingTime : 0;
        }
        return 30;
    });
    const [isExpired, setIsExpired] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();

    // Get email from multiple sources
    const [email, setEmail] = useState(() => {
        // First try from location state
        if (location.state?.email) {
            return location.state.email;
        }
        // Then try from user context
        if (user?.email) {
            return user.email;
        }
        // Then try from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                return parsedData.email;
            } catch (e) {
                console.error('Error parsing userData from localStorage:', e);
            }
        }
        return '';
    });

    // Update email if user context changes
    useEffect(() => {
        if (user?.email && !email) {
            setEmail(user.email);
        }
    }, [user, email]);

    // Redirect if user is already verified
    useEffect(() => {
        const checkVerification = async () => {
            try {
                const response = await axios.get('/users/me/');
                if (response.data.is_email_verified) {
                    if (response.data.role === 'Admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }
                // Update email if available from response
                if (response.data.email && !email) {
                    setEmail(response.data.email);
                }
            } catch (error) {
                console.error('Error checking verification status:', error);
            }
        };

        if (user) {
            checkVerification();
        }
    }, [navigate, user, email]);

    // Extract email from location state if available
    useEffect(() => {
        if (location.state?.email && !email) {
            setEmail(location.state.email);
        }
    }, [location, email]);

    // Countdown timer effect with localStorage persistence
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            // Save countdown and current timestamp to localStorage
            localStorage.setItem('verificationCountdown', countdown.toString());
            localStorage.setItem('verificationTimestamp', Date.now().toString());
            
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            setIsExpired(true);
            // Clear localStorage when expired
            localStorage.removeItem('verificationCountdown');
            localStorage.removeItem('verificationTimestamp');
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    const handleVerify = async () => {
        if (!code) {
            setNotification({ type: 'error', message: 'Please enter verification code' });
            return;
        }

        if (isExpired) {
            setNotification({ type: 'error', message: 'Code has expired. Please request a new code.' });
            return;
        }

        try {
            // First verify the code
            const verifyResponse = await axios.post('/users/verify_code/', { 
                code: code.trim()
            });
            
            if (verifyResponse.data.is_email_verified) {
                // Update user context with the new user data
                const { access } = JSON.parse(localStorage.getItem('tokens') || '{}');
                login(verifyResponse.data.user, access);
                
                setNotification({ 
                    type: 'success', 
                    message: verifyResponse.data.message || 'Email verified successfully!' 
                });
                
                // Clear countdown data from localStorage
                localStorage.removeItem('verificationCountdown');
                localStorage.removeItem('verificationTimestamp');
                
                // Wait for 1.5 seconds before redirecting
                setTimeout(() => {
                    if (verifyResponse.data.user.role === 'Admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Verification error:', error);
            let errorMessage = 'Verification failed. Please try again.';
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            setNotification({ 
                type: 'error', 
                message: errorMessage
            });
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setNotification({ 
                type: 'error', 
                message: 'No email address available. Please try logging in again.' 
            });
            return;
        }

        try {
            await axios.post('/users/regenerate_code/', { email });
            
            // Reset countdown and localStorage on new code request
            setCountdown(30);
            setIsExpired(false);
            localStorage.setItem('verificationCountdown', '30');
            localStorage.setItem('verificationTimestamp', Date.now().toString());
            
            setNotification({ 
                type: 'success', 
                message: 'New verification code sent. Please check your email.' 
            });
            
            // Clear the input field when requesting new code
            setCode('');
        } catch (error) {
            setNotification({ 
                type: 'error', 
                message: error.response?.data?.error || 'Error resending verification code. Please try again.' 
            });
        }
    };

    // If user is already verified, don't render the component
    if (user?.is_email_verified) {
        return null;
    }

    // If no email is available after all attempts, show error
    if (!email) {
        return (
            <>
                <Header />
                <div className="verify-email-page">
                    <h2>Error</h2>
                    <p>No email address available. Please try logging in again.</p>
                    <button onClick={() => navigate('/login')}>Back to Login</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="verify-email-page">
                <h2>Verify Your Email</h2>
                {notification.message && (
                    <p className={`notification ${notification.type}`}>{notification.message}</p>
                )}
                <p>Please verify your email to access the dashboard. <br />
                   <strong>Email: {email}</strong>
                </p>
                
                {!isExpired ? (
                    <div className="countdown">
                        Code expires in: {countdown} seconds
                    </div>
                ) : (
                    <p>Your verification code has expired.</p>
                )}
                
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter verification code"
                    maxLength={6}
                />
                
                <button onClick={handleVerify} disabled={isExpired || !code}>Verify</button>
                
                <div className="resend-container">
                    {isExpired ? (
                        <button onClick={handleResendCode}>Resend Code</button>
                    ) : (
                        <button onClick={handleResendCode} disabled={countdown > 0}>
                            Resend Code
                        </button>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VerifyEmail; 