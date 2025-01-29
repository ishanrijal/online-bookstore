import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditBook() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBook = async () => {
            const response = await fetch(`/api/books/${id}`); // Adjust the endpoint as needed
            const data = await response.json();
            setBook(data);
        };

        fetchBook();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Send PUT request to update the book (replace with your API endpoint)
        await fetch(`/api/books/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book),
        });

        navigate('/admin/manage-books'); // Redirect to manage books
    };

    if (!book) return <div>Loading...</div>;

    return (
        <div>
            <h2>Edit Book</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input type="text" value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} required />
                </div>
                <div>
                    <label>ISBN:</label>
                    <input type="text" value={book.isbn} onChange={(e) => setBook({ ...book, isbn: e.target.value })} required />
                </div>
                <div>
                    <label>Price:</label>
                    <input type="number" value={book.price} onChange={(e) => setBook({ ...book, price: e.target.value })} required />
                </div>
                <div>
                    <label>Authors:</label>
                    <input type="text" value={book.authors.map(author => author.user.username).join(', ')} onChange={(e) => setBook({ ...book, authors: e.target.value.split(',') })} placeholder="Comma separated" required />
                </div>
                <div>
                    <label>Category:</label>
                    <input type="text" value={book.category} onChange={(e) => setBook({ ...book, category: e.target.value })} required />
                </div>
                <div>
                    <label>Language:</label>
                    <select value={book.language} onChange={(e) => setBook({ ...book, language: e.target.value })}>
                        <option value="English">English</option>
                        <option value="Nepali">Nepali</option>
                    </select>
                </div>
                <button type="submit">Update Book</button>
            </form>
        </div>
    );
}

export default EditBook; 