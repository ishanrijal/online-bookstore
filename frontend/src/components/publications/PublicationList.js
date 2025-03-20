import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBook } from 'react-icons/fa';
import Breadcrumb from '../common/Breadcrumb';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import './PublicationList.css';

const ITEMS_PER_PAGE = 12;

export default function PublicationList() {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/publications?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
                setPublications(response.data.publications);
                setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
            } catch (error) {
                console.error('Error fetching publications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublications();
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="publications-page">
            <div className="container">
                <Breadcrumb items={[
                    { label: 'Home', path: '/' },
                    { label: 'Publications', path: '/publications' }
                ]} />

                <div className="publications-grid">
                    {publications.map((publication) => (
                        <Link
                            to={`/publications/${publication.slug}`}
                            key={publication._id}
                            className="publication-card"
                        >
                            <div className="publication-card__image">
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
                            <div className="publication-card__content">
                                <h3>{publication.name}</h3>
                                <p className="description">
                                    {publication.description || 'No description available'}
                                </p>
                                <div className="publication-card__meta">
                                    <div className="books-count">
                                        <FaBook />
                                        <span>{publication.booksCount} Books</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
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
    );
}; 