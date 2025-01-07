import React, { useState } from 'react';
import Logo from '../assets/images/logo.png';
import Login from './Login';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  return (
    <header className="header-wrapper">
      <div className="container">
        <div className="header">
          <div className="logo">
            <img src={Logo} alt="Logo" />
            <span className="site-title">BookPasal</span>
          </div>
          <div className="header-left-wrapper">
            <nav className="navigation">
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/categories">Categories</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/about">About Us</a></li>
              </ul>
            </nav>
            <div className="login-button">
              <button onClick={toggleLogin}>Login</button>
            </div>
          </div>
        </div>
      </div>
      
      {showLogin && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={toggleLogin}>×</button>
            <Login />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;