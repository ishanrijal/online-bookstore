import React from 'react';
import '../assets/css/style.css';
import Login from './Login';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';
import BookList from './BookList';
import CategoryList from './CategoryList';
import FeaturedBooks from './FeaturedBooks';

function Home() {
    // Sample data for demonstration
    const books = [
        { id: 1, title: 'Book One', author: 'Author One', price: 19.99 },
        { id: 2, title: 'Book Two', author: 'Author Two', price: 29.99 },
        // Add more books as needed
    ];

    const categories = [
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Non-Fiction' },
        // Add more categories as needed
    ];

    const featuredBooks = [
        { id: 1, title: 'Featured Book One', author: 'Featured Author One', price: 24.99 },
        { id: 2, title: 'Featured Book Two', author: 'Featured Author Two', price: 34.99 },
        // Add more featured books as needed
    ];

    return (
        <div className="home">
            <Header />
            <Banner />
            <BookList books={books} />
            <CategoryList categories={categories} />
            <FeaturedBooks featuredBooks={featuredBooks} />
            <Footer />
        </div>
    );
}

export default Home;