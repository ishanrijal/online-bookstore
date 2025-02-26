import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import AdminSidebar from './Sidebar';
import AdminOverview from './AdminOverview';
import ManageBooks from './books/ManageBooks';
import ManageOrders from './orders/ManageOrders';
import ManageUsers from './users/ManageUsers';
import { ManagePayments } from './payments';
import ManageReviews from './reviews/ManageReviews';
import AddBook from './books/AddBook';
import EditBook from './books/EditBook';
import BookDetail from './books/BookDetail';
import CategoryList from './categories/CategoryList';
import CategoryForm from './categories/CategoryForm';
import CategoryBooks from './categories/CategoryBooks';
import './admin.css';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import OrderDetail from './orders/OrderDetail';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <Header />
            <div className="dashboard">
                <AdminSidebar />
                <main className="dashboard__content">
                    <Routes>
                        <Route index element={<AdminOverview />} />
                        <Route path="manage-books" element={<ManageBooks />} />
                        <Route path="manage-books/new" element={<AddBook />} />
                        <Route path="manage-books/edit/:id" element={<EditBook />} />
                        <Route path="books/:id" element={<BookDetail />} />
                        <Route path="manage-categories" element={<CategoryList />} />
                        <Route path="manage-categories/new" element={<CategoryForm />} />
                        <Route path="manage-categories/edit/:id" element={<CategoryForm />} />
                        <Route path="categories/:slug" element={<CategoryBooks />} />
                        <Route path="manage-orders" element={<ManageOrders />} />
                        <Route path="manage-orders/:id" element={<OrderDetail />} />
                        <Route path="manage-users/*" element={<ManageUsers />} />
                        <Route path="manage-payments/*" element={<ManagePayments />} />
                        <Route path="manage-reviews" element={<ManageReviews />} />
                    </Routes>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard; 