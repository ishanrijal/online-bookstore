import React from 'react';
import '../assets/css/style.css';
import Login from './Login';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';

function Home() {
    return (
        <div className="home">
            <Header />
            <Banner />
            <Footer />
        </div>
    );
}

export default Home;