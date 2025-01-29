import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ManageBooks() {
    const [books, setBooks] = useState([]);
    const mockLogin = () => {
        const token = "dummy_token_for_development"; // Your dummy token
        localStorage.setItem('token', token);
    };
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                mockLogin();
                const token = localStorage.getItem('token'); // Get the token from local storage
                console.log(token);
                const response = await axios.get('http://127.0.0.1:8000/api/books/books', {
                    // headers: {
                    //     'Authorization': `Bearer ${token}`, // Include the token in the headers
                    // },
                });
                setBooks(response.data); // Set the fetched books to state
            } catch (error) {
                console.error('Error fetching books:', error);
                // Handle error (e.g., show a notification)
            }
        };

        fetchBooks();
    }, []);

    const handleDelete = async (id) => {
        // Show confirmation dialog
        const confirmDelete = window.confirm("Do you want to delete this book permanently?");
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token'); // Get the token from local storage
                await axios.delete(`http://127.0.0.1:8000/api/books/books/${id}/`, {
                    // headers: {
                    //     'Authorization': `Bearer ${token}`, // Include the token in the headers
                    // },
                });
                setBooks(books.filter(book => book.id !== id)); // Remove the deleted book from state
            } catch (error) {
                console.error('Error deleting book:', error);
                // Handle error (e.g., show a notification)
            }
        }
    };


    return (
        <div>
            <h2>Manage Books</h2>
            <Link to="/admin/manage-books/new" className="new-book-button">New Book</Link>
            <table className="book-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>ISBN</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.isbn}</td>
                            <td>${book.price}</td>
                            <td>{book.stock}</td>
                            <td>
                                <Link to={`/admin/manage-books/${book.id}`}>View</Link>
                                <Link to={`/admin/manage-books/edit/${book.id}`}>Edit</Link>
                                <button onClick={() => handleDelete(book.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageBooks; 