import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../utils/axios';

function ManageBooks() {
    const [books, setBooks] = useState([]);
    
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('/books/');
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await axios.delete(`/books/${id}/`);
                // Refresh the books list after deletion
                fetchBooks();
            } catch (error) {
                console.error('Error deleting book:', error.response?.data || error.message);
            }
        }
    };

    return (
        <div className="admin-book-list-wrapper">
            <div className="admin-header">
                <h2>Manage Books</h2>
                <Link to="/admin/manage-books/new" className="new-book-button">Add New Book</Link>
            </div>
            <table className="admin-table">
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
                            <td className="actions">
                                <Link to={`/admin/manage-books/edit/${book.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                <button onClick={() => handleDelete(book.id)} className="btn btn-sm btn-danger">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageBooks; 