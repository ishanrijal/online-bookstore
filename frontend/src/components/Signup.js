import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    favoriteGenre: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <>
      <Header />
      <main className="signup-page">
        <div className="container">
          <div className="signup-wrapper">
            <form onSubmit={handleSubmit}>
              <h2>Create Account</h2>
              <p className="subtitle">Join our book-loving community</p>
              
              <div className="input-field">
                <input 
                  type="text" 
                  id="fullName"
                  required
                />
                <label htmlFor="fullName">Full Name</label>
              </div>

              <div className="input-field">
                <input 
                  type="email" 
                  id="email"
                  required
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="input-field">
                <input 
                  type="password" 
                  id="password"
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <div className="input-field">
                <input 
                  type="password" 
                  id="confirmPassword"
                  required
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>

              <div className="input-field">
                <input 
                  type="tel" 
                  id="phone"
                  required
                />
                <label htmlFor="phone">Phone Number</label>
              </div>

              <div className="input-field">
                <input 
                  type="text" 
                  id="address"
                  required
                />
                <label htmlFor="address">Delivery Address</label>
              </div>

              <div className="input-field">
                <select id="favoriteGenre" required>
                  <option value="">Select Genre</option>
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="mystery">Mystery</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="romance">Romance</option>
                </select>
                <label htmlFor="favoriteGenre">Favorite Book Genre</label>
              </div>

              <div className="terms">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">I agree to the Terms & Conditions</label>
              </div>

              <button type="submit">Create Account</button>

              <p className="login-link">
                Already have an account? <a href="/login">Login here</a>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};