import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import '../sass/components/_notificationBox.sass';

const Signup = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Reader',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    profile_picture: null,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    type: '',
    message: '',
    details: null
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    console.log("Starting form validation");
    const newErrors = {};

    // Required fields according to backend
    if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
    }

    if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
    }

    // Optional fields validation (only if they have a value)
    if (formData.phone && formData.phone.length > 15) {
        newErrors.phone = 'Phone number must be 15 characters or less';
    }

    if (formData.first_name && formData.first_name.length > 150) {
        newErrors.first_name = 'First name must be 150 characters or less';
    }

    if (formData.last_name && formData.last_name.length > 150) {
        newErrors.last_name = 'Last name must be 150 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          profile_picture: 'File size should be less than 5MB'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));
      setErrors(prev => ({
        ...prev,
        profile_picture: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid || loading) {
        return;
    }
    
    setLoading(true);
    try {
        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'profile_picture') {
                if (formData[key] instanceof File) {
                    submitData.append(key, formData[key]);
                }
            } else {
                submitData.append(key, formData[key] || '');
            }
        });

        // Register the user
        const response = await axios.post('/users/', submitData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 201) {
            // Log in the user
            const loginResponse = await axios.post('/users/token/', {
                username: formData.username,
                password: formData.password
            });

            const accessToken = loginResponse.data.access;
            const refreshToken = loginResponse.data.refresh;

            // Store tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Set token in axios defaults
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Get user data
            const userResponse = await axios.get('/users/me/');
            const userData = userResponse.data;

            // Update auth context
            login(userData, accessToken);

            setNotification({
                type: 'success',
                message: 'Account created successfully! Redirecting to email verification...',
                details: null
            });

            // Redirect to email verification page with email
            setTimeout(() => {
                navigate('/verify-email', { state: { email: formData.email } });
            }, 1500);
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.response?.data) {
            const errorData = error.response.data;
            
            if (typeof errorData === 'object') {
                const fieldErrors = {};
                const errorDetails = [];
                
                Object.keys(errorData).forEach(key => {
                    const messages = Array.isArray(errorData[key]) 
                        ? errorData[key] 
                        : [errorData[key]];
                    
                    fieldErrors[key] = messages[0];
                    errorDetails.push(`${key}: ${messages[0]}`);
                });
                
                setErrors(fieldErrors);
                setNotification({
                    type: 'error',
                    message: 'Registration failed',
                    details: errorDetails
                });
            } else {
                setNotification({
                    type: 'error',
                    message: 'Registration failed. Please try again.',
                    details: null
                });
            }
        } else {
            setNotification({
                type: 'error',
                message: 'Network error. Please check your connection and try again.',
                details: null
            });
        }
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <>
      <Header />
      <main className="signup-page">
        {notification.message && (
          <div className={`notification-box notification-box--${notification.type}`}>
            <div className="notification-box__content">
              <span className="notification-box__message">{notification.message}</span>
              {notification.details && (
                <ul className="notification-box__details">
                  {notification.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
            <button 
              className="notification-box__close"
              onClick={() => setNotification({ type: '', message: '', details: null })}
            >
              ×
            </button>
            <div className="notification-box__border"></div>
          </div>
        )}
        <div className="container">
          <div className="signup-wrapper">
            <form onSubmit={handleSubmit} className="signup-form" encType="multipart/form-data" noValidate>
              <div className="form-header">
                <h2>Create Account</h2>
                <p className="subtitle">Join our book-loving community</p>
              </div>

              {errors.submit && <div className="error-message">{errors.submit}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}

              <div className="form-body">
                <div className="input-field">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="username">Username</label>
                  {errors.username && <p className="error">{errors.username}</p>}
                </div>

                <div className="input-field">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email">Email Address</label>
                  {errors.email && <p className="error">{errors.email}</p>}
                </div>

                <div className="input-field">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                  {errors.password && <p className="error">{errors.password}</p>}
                </div>

                <div className="input-field">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                </div>

                <div className="input-field">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="first_name">First Name</label>
                  {errors.first_name && <p className="error">{errors.first_name}</p>}
                </div>

                <div className="input-field">
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="last_name">Last Name</label>
                  {errors.last_name && <p className="error">{errors.last_name}</p>}
                </div>

                <div className="input-field">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="phone">Phone Number</label>
                  {errors.phone && <p className="error">{errors.phone}</p>}
                </div>

                <div className="input-field">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <label htmlFor="address">Delivery Address</label>
                  {errors.address && <p className="error">{errors.address}</p>}
                </div>

                <div className="input-field">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="Reader">Reader</option>
                    <option value="Author">Author</option>
                    <option value="Publisher">Publisher</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <label htmlFor="role">Role</label>
                </div>

                <div className="input-field">
                  <input
                    type="file"
                    name="profile_picture"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="profile_picture">Profile Picture</label>
                  {errors.profile_picture && <p className="error">{errors.profile_picture}</p>}
                </div>
              </div>

              <div className="form-footer">
                <button 
                  type="submit" 
                  className={`submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup;
