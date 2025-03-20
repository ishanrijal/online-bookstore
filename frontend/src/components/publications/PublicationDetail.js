import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBook } from 'react-icons/fa';
import Breadcrumb from '../common/Breadcrumb';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import BookCard from '../common/BookCard';
import './PublicationDetail.css';

const ITEMS_PER_PAGE = 12;

export default function PublicationDetail() {
    const { slug } = useParams();
    const [publication, setPublication] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchPublicationDetails = async () => {
            try {
                setLoading(true);
                const [publicationResponse, booksResponse] = await Promise.all([
                    axios.get(`/api/publications/${slug}`),
                    axios.get(`/api/publications/${slug}/books?page=${currentPage}&limit=${ITEMS_PER_PAGE}`)
                ]);

                setPublication(publicationResponse.data);
                setBooks(booksResponse.data.books);
                setTotalPages(Math.ceil(booksResponse.data.total / ITEMS_PER_PAGE));
            } catch (error) {
                console.error('Error fetching publication details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicationDetails();
    }, [slug, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!publication) {
        return (
            <div className="publication-detail-page">
                <div className="container">
                    <div className="error-message">
                        Publication not found
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="publication-detail-page">
            <div className="container">
                <Breadcrumb items={[
                    { label: 'Home', path: '/' },
                    { label: 'Publications', path: '/publications' },
                    { label: publication.name, path: `/publications/${slug}` }
                ]} />

                <div className="publication-header">
                    <div className="publication-profile">
                        <div className="publication-image">
                            {publication.logo ? (
                                <img
                                    src={publication.logo}
                                    alt={publication.name}
                                />
                            ) : (
                                <div className="default-logo">
                                    <FaBook />
                                </div>
                            )}
                        </div>
                        <div className="publication-info">
                            <h1>{publication.name}</h1>
                            <p className="description">
                                {publication.description || 'No description available'}
                            </p>
                            <div className="publication-stats">
                                <div className="stat">
                                    <span className="stat-value">{publication.booksCount}</span>
                                    <span className="stat-label">Books Published</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="books-section">
                    <h2>Books by {publication.name}</h2>
                    <div className="books-grid">
                        {books.map((book) => (
                            <BookCard key={book._id} book={book} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 