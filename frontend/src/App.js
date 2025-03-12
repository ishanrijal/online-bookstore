import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Import components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Signup';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import BookDetail from './components/BookDetail';
import About from './components/About';
import Contact from './components/Contact';
import Categories from './components/Categories';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import VerifyEmail from './components/VerifyEmail';
// import NotFound from './components/NotFound';
import './assets/css/style.css';  // Import the compiled CSS

// Create a new component for email verification check
const EmailVerificationCheck = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_email_verified && window.location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/categories" element={<Categories />} />

            {/* Verify Email Route - only for logged in users */}
            <Route path="/verify-email" element={
              <ProtectedRoute>
                <VerifyEmail />
              </ProtectedRoute>
            } />

            {/* Protected User Routes with Email Verification Check */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute roles={['READER']}>
                <EmailVerificationCheck>
                  <UserDashboard />
                </EmailVerificationCheck>
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute roles={['READER']}>
                <EmailVerificationCheck>
                  <Cart />
                </EmailVerificationCheck>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute roles={['READER']}>
                <EmailVerificationCheck>
                  <Checkout />
                </EmailVerificationCheck>
              </ProtectedRoute>
            } />
            <Route path="/payment/success/:paymentId" element={
              <ProtectedRoute roles={['READER']}>
                <EmailVerificationCheck>
                  <PaymentSuccess />
                </EmailVerificationCheck>
              </ProtectedRoute>
            } />
            <Route path="/payment/failure/:paymentId" element={
              <ProtectedRoute roles={['READER']}>
                <EmailVerificationCheck>
                  <PaymentFailure />
                </EmailVerificationCheck>
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute roles={['ADMIN']}>
                <EmailVerificationCheck>
                  <AdminDashboard />
                </EmailVerificationCheck>
              </ProtectedRoute>
            } />

            {/* Catch all - 404 */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;