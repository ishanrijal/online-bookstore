import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
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

  const validateForm = () => {
    console.log("Starting form validation");
    const newErrors = {};

    // Log current form data
    console.log("Current form data:", formData);

    if (!formData.username.trim()) {
      console.log("Username validation failed");
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      console.log("Email validation failed - empty");
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      console.log("Email validation failed - invalid format");
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password.trim()) {
      console.log("Password validation failed - empty");
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      console.log("Password validation failed - too short");
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.first_name.trim()) {
      console.log("First name validation failed");
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      console.log("Last name validation failed");
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      console.log("Phone validation failed");
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.address.trim()) {
      console.log("Address validation failed");
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    console.log("Validation result:", Object.keys(newErrors).length === 0);
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
    console.log("Form submission started");
    e.preventDefault();
    
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    
    if (!isValid || isSubmitting) {
        console.log("Form submission stopped - validation failed or already submitting");
        return;
    }
    
    console.log("Form validation passed");
    setIsSubmitting(true);
    try {
        // Create FormData object
        const submitData = new FormData();
        
        // Log the data being sent
        console.log("Sending form data:", formData);
        
        // Add all form fields to FormData
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                if (key === 'profile_picture' && formData[key] instanceof File) {
                    submitData.append(key, formData[key]);
                } else {
                    submitData.append(key, formData[key]);
                }
            }
        });

        const response = await axios.post(
            'http://127.0.0.1:8000/api/users/', 
            submitData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
            }
        );

        if (response.status === 201) {
            setSuccessMessage('Account created successfully! Please verify your email before logging in.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    } catch (error) {
        console.error('Registration error details:', error.response?.data);
        const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Registration failed. Please try again.';
                          
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        } else {
            setErrors({ submit: errorMessage });
        }
    } finally {
        setIsSubmitting(false);
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
                  className="submit-btn" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
