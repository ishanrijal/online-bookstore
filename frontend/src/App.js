import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Signup';
import Categories from './components/Categories';
import Contact from './components/Contact';
import About from './components/About';
import AdminDashboard from './components/admin/AdminDashboard';
import { ManageBooks, AddBook, EditBook } from './components/admin/books';
import ManageOrders from './components/admin/orders/ManageOrders';
import ManageUsers from './components/admin/ManageUsers';
import ManagePayments from './components/admin/ManagePayments';
import ManageReviews from './components/admin/ManageReviews';
import AdminBookDetail from './components/admin/books/BookDetail';
import BookDetail from './components/books/BookDetail';
import Cart from './components/cart/Cart';
import './assets/css/style.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="manage-books" element={<ManageBooks />} />
          <Route path="manage-books/:id" element={<AdminBookDetail />} />
          <Route path="manage-books/new" element={<AddBook />} />
          <Route path="manage-books/edit/:id" element={<EditBook />} />
          <Route path="manage-orders" element={<ManageOrders />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-payments" element={<ManagePayments />} />
          <Route path="manage-reviews" element={<ManageReviews />} />
        </Route>
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;