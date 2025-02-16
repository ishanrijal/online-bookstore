import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Home';
import Register from '../components/Signup';
import Categories from '../components/Categories';
import Contact from '../components/Contact';
import About from '../components/About';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';
import Login from '../components/Login';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from '../context/AuthContext';
import Checkout from '../components/Checkout';
import PaymentSuccess from '../components/PaymentSuccess';
import PaymentFailure from '../components/PaymentFailure';
import BookDetail from '../components/BookDetail';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={
                <PublicOnlyRoute>
                    <Register />
                </PublicOnlyRoute>
            } />
            <Route path="/login" element={
                <PublicOnlyRoute>
                    <Login />
                </PublicOnlyRoute>
            } />
            <Route path="/categories" element={<Categories />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/book/:id" element={<BookDetail />} />

            {/* Protected User Routes */}
            <Route path="/dashboard/*" element={
                <ProtectedRoute>
                    <UserDashboard />
                </ProtectedRoute>
            } />
            <Route path="/checkout" element={
                <ProtectedRoute>
                    <Checkout />
                </ProtectedRoute>
            } />
            <Route path="/payment/success/:paymentId" element={
                <ProtectedRoute>
                    <PaymentSuccess />
                </ProtectedRoute>
            } />
            <Route path="/payment/failure/:paymentId" element={
                <ProtectedRoute>
                    <PaymentFailure />
                </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
            } />
        </Routes>
    );
};

export default AppRoutes; 