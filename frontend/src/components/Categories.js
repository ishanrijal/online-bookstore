import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Categories() {
  return (
    <>
        <Header />
        <div className="container">
            <div class="categories-wrapper">
                <h2>Our Categories</h2>
                <p>BookPasal is an online bookstore that offers a wide range of books. We have books in various categories such as fiction, non-fiction, children's books, and more. Our goal is to provide our customers with the best selection of books at the best prices. We are committed to providing excellent customer service and making the book buying process as easy as possible. We hope you enjoy shopping with us!</p>
            </div>
        </div>
        <Footer />
    </>
  );
};