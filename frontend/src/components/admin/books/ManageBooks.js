import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ManageBooks() {
    const [books, setBooks] = useState([]);
    
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/books/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooks();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Do you want to delete this book permanently?");
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://127.0.0.1:8000/api/books/books/${id}/`, {
                    // headers: {
                    //     'Authorization': `Bearer ${token}`,
                    // },
                });

                if (response.data.status === 'success') {
                    // Remove the book from state
                    setBooks(books.filter(book => book.id !== id));
                    // Show success message (you can implement a notification system)
                    console.log(response.data.message);
                }
            } catch (error) {
                console.error('Error deleting book:', error);
                const errorMessage = error.response?.data?.message || 'Error deleting book';
                // Show error message to user (you can implement a notification system)
                alert(errorMessage);
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