import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Header';
import Footer from '../Footer';
import DashboardSidebar from './DashboardSidebar';
import DashboardOverview from './DashboardOverview';
import OrderHistory from './OrderHistory';
import Profile from './Profile';
import UserReviews from './UserReviews';
import DashboardCart from './DashboardCart';
import ManageUserBooks from './ManageUserBooks';
import BookForm from './BookForm';
import Wishlist from './Wishlist';
import '../../sass/components/_dashboard.sass';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <>
            <Header />
            <div className="dashboard">
                <DashboardSidebar />
                <main className="dashboard__content">
                    <Routes>
                        <Route index element={<DashboardOverview />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="reviews" element={<UserReviews />} />
                        {/* Reader-specific routes */}
                        {user?.role === 'Reader' && (
                            <>
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="cart" element={<DashboardCart />} />
                                <Route path="wishlist" element={<Wishlist />} />
                            </>
                        )}

                        {/* Author-specific routes */}
                        {user?.role === 'Author' && (
                            <Route path="manage-books" element={<ManageUserBooks />} />
                        )}

                        {/* Publisher-specific routes */}
                        {user?.role === 'Publisher' && (
                            <>
                                <Route path="manage-books" element={<ManageUserBooks />} />
                                <Route path="manage-books/new" element={<BookForm />} />
                                <Route path="manage-books/edit/:id" element={<BookForm />} />
                            </>
                        )}
                    </Routes>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default UserDashboard; 