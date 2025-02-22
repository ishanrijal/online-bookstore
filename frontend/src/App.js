import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
// import NotFound from './components/NotFound';
import './assets/css/style.css';  // Import the compiled CSS

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

            {/* Protected User Routes */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute roles={['READER']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute roles={['READER']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute roles={['READER']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/payment/success/:paymentId" element={
              <ProtectedRoute roles={['READER']}>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/payment/failure/:paymentId" element={
              <ProtectedRoute roles={['READER']}>
                <PaymentFailure />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
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