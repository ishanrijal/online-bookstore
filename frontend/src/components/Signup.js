import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'Reader', // Default role
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number (10-15 digits).';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:8001/api/signup/', {
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
        contact: formData.phone,
        address: formData.address,
        role: formData.role,
      });
      if (response.status === 201) {
        setSuccessMessage('Account created successfully! You can now log in.');
        alert('Account created successfully! You can now log in.');
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          address: '',
          role: 'Reader',
          agreeToTerms: false,
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ server: error.response.data.message || 'An error occurred. Please try again.' });
      } else {
        setErrors({ server: 'Network error. Please check your connection.' });
      }
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
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-header">
                <h2>Create Account</h2>
                <p className="subtitle">Join our book-loving community</p>
              </div>

              {errors.server && <p className="error">{errors.server}</p>}
              {successMessage && <p className="success">{successMessage}</p>}

              <div className="form-body">
                <div className="input-field">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="fullName">Full Name</label>
                  {errors.fullName && <p className="error">{errors.fullName}</p>}
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
                  </select>
                  <label htmlFor="role">Role</label>
                </div>

                <div className="terms-checkbox">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="agreeToTerms">I agree to the Terms & Conditions</label>
                  {errors.agreeToTerms && <p className="error">{errors.agreeToTerms}</p>}
                </div>
              </div>

              <div className="form-footer">
                <button type="submit">Create Account</button>
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
