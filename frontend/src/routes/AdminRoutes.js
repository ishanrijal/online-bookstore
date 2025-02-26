import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import CategoryList from '../components/admin/categories/CategoryList';
import CategoryForm from '../components/admin/categories/CategoryForm';
import CategoryBooks from '../components/admin/categories/CategoryBooks';
import ManageBooks from '../components/admin/books/ManageBooks';
import AddBook from '../components/admin/books/AddBook';
import EditBook from '../components/admin/books/EditBook';
import BookDetail from '../components/admin/books/BookDetail';
import OrderList from '../components/admin/orders/OrderList';
import OrderDetail from '../components/admin/orders/OrderDetail';
import { ManagePayments } from '../components/admin/payments';
import { ManageUsers } from '../components/admin/users';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<div>Dashboard</div>} />
                
                {/* Books Management Routes */}
                <Route path="manage-books" element={<ManageBooks />} />
                <Route path="manage-books/new" element={<AddBook />} />
                <Route path="manage-books/edit/:id" element={<EditBook />} />
                <Route path="books/:id" element={<BookDetail />} />

                {/* Categories Management Routes */}
                <Route path="manage-categories" element={<CategoryList />} />
                <Route path="manage-categories/new" element={<CategoryForm />} />
                <Route path="manage-categories/edit/:id" element={<CategoryForm />} />
                <Route path="categories/:slug" element={<CategoryBooks />} />

                {/* Orders Management Routes */}
                <Route path="manage-orders" element={<OrderList />} />
                <Route path="manage-orders/:id" element={<OrderDetail />} />

                {/* Payments Management Routes */}
                <Route path="manage-payments/*" element={<ManagePayments />} />

                {/* Users Management Routes */}
                <Route path="manage-users/*" element={<ManageUsers />} />

                {/* Other Admin Routes */}
                <Route path="manage-reviews" element={<div>Manage Reviews</div>} />

                {/* 404 for admin routes */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes; 