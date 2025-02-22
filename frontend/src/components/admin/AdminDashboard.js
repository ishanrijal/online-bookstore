import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import AdminSidebar from './Sidebar';
import AdminOverview from './AdminOverview';
import ManageBooks from './books/ManageBooks';
import ManageOrders from './orders/ManageOrders';
import ManageUsers from './ManageUsers';
import ManagePayments from './ManagePayments';
import ManageReviews from './ManageReviews';
import AddBook from './books/AddBook';
import './admin.css';

const AdminDashboard = () => {
    return (
        <>
            <Header />
            <div className="dashboard">
                <AdminSidebar />
                <main className="dashboard__content">
                    <Routes>
                        <Route index element={<AdminOverview />} />
                        <Route path="manage-books/*" element={<ManageBooks />} />
                        <Route path="manage-books/new" element={<AddBook />} />
                        <Route path="manage-orders" element={<ManageOrders />} />
                        <Route path="manage-users" element={<ManageUsers />} />
                        <Route path="manage-payments" element={<ManagePayments />} />
                        <Route path="manage-reviews" element={<ManageReviews />} />
                    </Routes>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default AdminDashboard; 