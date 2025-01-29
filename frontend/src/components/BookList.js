import React from 'react';

function BookList({ books }) {
    return (
        <div className="book-list">
            <h2>Browse Books</h2>
            <div className="books">
                {books.map((book) => (
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

export default BookList; 