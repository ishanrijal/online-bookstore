import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import DashboardSidebar from './DashboardSidebar';
import OrderHistory from './OrderHistory';
import Profile from './Profile';
import UserReviews from './UserReviews';
import '../../sass/components/_dashboard.sass';

const UserDashboard = () => {
    return (
        <>
            <Header />
            <div className="dashboard">
                <DashboardSidebar />
                <main className="dashboard__content">
                    <Routes>
                        <Route path="profile" element={<Profile />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="reviews" element={<UserReviews />} />
                        {/* Add other dashboard routes here */}
                    </Routes>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default UserDashboard; 