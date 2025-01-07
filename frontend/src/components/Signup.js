import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const Signup = () => {
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

              <div className="form-body">
                <div className="input-group">
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
                </div>

                <div className="input-group">
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
                  <textarea 
                    id="address"
                    required
                  ></textarea>
                  <label htmlFor="address">Delivery Address</label>
                </div>

                <div className="input-field">
                  <select id="favoriteGenre" required>
                    <option value="">Select your favorite genre</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="mystery">Mystery</option>
                    <option value="sci-fi">Science Fiction</option>
                    <option value="romance">Romance</option>
                  </select>
                </div>

                <div className="terms-checkbox">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">I agree to the Terms & Conditions</label>
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