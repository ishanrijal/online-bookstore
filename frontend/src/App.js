import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Signup';
import Categories from './components/Categories';
import Contact from './components/Contact';
import About from './components/About';
import AdminDashboard from './components/admin/AdminDashboard';
import { ManageBooks, AddBook } from './components/admin/books';
import ManageOrders from './components/admin/orders/ManageOrders';
import ManageUsers from './components/admin/ManageUsers';
import ManagePayments from './components/admin/ManagePayments';
import ManageReviews from './components/admin/ManageReviews';
import AdminBookDetail from './components/admin/books/BookDetail';
import BookDetail from './components/BookDetail';
import Cart from './components/Cart';
import UserDashboard from './components/dashboard/UserDashboard';
import Login from './components/Login';
import { AuthProvider, ProtectedRoute, PublicOnlyRoute, AdminRoute } from './context/AuthContext';
import EditBook from './components/admin/books/EditBook';
import AdminHome from './components/admin/AdminHome';
import Checkout from './components/Checkout';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import './assets/css/style.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />
          <Route path="/categories" element={<Categories />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />

          {/* Protected User Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="manage-books" element={<ManageBooks />} />
            <Route path="manage-books/:id" element={<AdminBookDetail />} />
            <Route path="manage-books/new" element={<AddBook />} />
            <Route path="manage-books/edit/:id" element={<EditBook />} />
            <Route path="manage-orders" element={<ManageOrders />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-payments" element={<ManagePayments />} />
            <Route path="manage-reviews" element={<ManageReviews />} />
          </Route>

          <Route path="/book/:id" element={<BookDetail />} />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;