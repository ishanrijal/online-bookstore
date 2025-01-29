import React from 'react';

function FeaturedBooks({ featuredBooks }) {
    return (
        <div className="featured-books">
            <h2>Featured Books</h2>
            <div className="books">
                {featuredBooks.map((book) => (
                    <div key={book.id} className="book-item">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <p>${book.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeaturedBooks; 