import React from 'react';
import '../assets/css/style.css';
import '../sass/style.scss'
import Login from './Login';
import Header from './Header';
import Banner from './Banner';
import Footer from './Footer';

function App() {
    return (
        <div className="App">
            <Header />
            <Banner />
            <Footer />
        </div>
    );
}

export default App;