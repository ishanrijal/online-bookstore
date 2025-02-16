import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import './UserDashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
    }, [navigate]);

    if (!user) return null;

    return (
        <>
            <Header />
            <main className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome, {user.first_name || user.username}!</h1>
                    <p>Your Role: {user.role}</p>
                </div>

                <div className="dashboard-content">
                    <div className="dashboard-cards">
                        {user.role === 'Author' && (
                            <>
                                <div className="dashboard-card">
                                    <h3>My Books</h3>
                                    <p>Manage your published books</p>
                                    <button onClick={() => navigate('/author/books')}>View Books</button>
                                </div>
                                <div className="dashboard-card">
                                    <h3>New Book</h3>
                                    <p>Add a new book to your collection</p>
                                    <button onClick={() => navigate('/author/books/new')}>Add Book</button>
                                </div>
                            </>
                        )}

                        {user.role === 'Publisher' && (
                            <>
                                <div className="dashboard-card">
                                    <h3>Published Books</h3>
                                    <p>View and manage published books</p>
                                    <button onClick={() => navigate('/publisher/books')}>View Books</button>
                                </div>
                                <div className="dashboard-card">
                                    <h3>Authors</h3>
                                    <p>Manage your authors</p>
                                    <button onClick={() => navigate('/publisher/authors')}>View Authors</button>
                                </div>
                            </>
                        )}

                        {user.role === 'Reader' && (
                            <>
                                <div className="dashboard-card">
                                    <h3>My Orders</h3>
                                    <p>View your order history</p>
                                    <button onClick={() => navigate('/orders')}>View Orders</button>
                                </div>
                                <div className="dashboard-card">
                                    <h3>Wishlist</h3>
                                    <p>View your saved books</p>
                                    <button onClick={() => navigate('/wishlist')}>View Wishlist</button>
                                </div>
                            </>
                        )}

                        <div className="dashboard-card">
                            <h3>Profile</h3>
                            <p>Update your personal information</p>
                            <button onClick={() => navigate('/profile')}>Edit Profile</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default UserDashboard; 