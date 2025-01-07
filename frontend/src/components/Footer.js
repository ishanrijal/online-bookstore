import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
        <div className='container'>
            <div className="footer-top">
                <div className="footer-left">
                    <h2>BookPasal</h2>
                    <p>Get your favorite books at your finger tips.</p>
                </div>
                <div className="footer-center">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/about">About Us</a></li>
                    </ul>
                </div>
                <div className="footer-right">
                    <h3>Contact Us</h3>
                    <p>BookPasal Pvt. Ltd.</p>
                    <p>Putalisadak, Kathmandu</p>
                    <p>Phone: 01-1234567</p>
                    <p>Email: info@bookpasal.com </p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; Copyright 2025 <a href="/">BookPasal</a>. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
  );
};