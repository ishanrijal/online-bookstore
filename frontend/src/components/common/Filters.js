import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './Filters.css';

const Filters = ({ 
    filters, 
    setFilters, 
    categories = [], 
    publications = [], 
    sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Rating' }
    ]
}) => {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="filters-container">
            <div className="filters-header">
                <FaFilter className="filter-icon" />
                <h3>Filters</h3>
            </div>

            <div className="filters-body">
                {/* Search Filter */}
                <div className="filter-group">
                    <label>Search</label>
                    <div className="search-input">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={filters.category || ''}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Publication Filter */}
                {publications.length > 0 && (
                    <div className="filter-group">
                        <label>Publication</label>
                        <select
                            value={filters.publication || ''}
                            onChange={(e) => handleFilterChange('publication', e.target.value)}
                        >
                            <option value="">All Publications</option>
                            {publications.map(pub => (
                                <option key={pub.id} value={pub.id}>
                                    {pub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Price Range Filter */}
                <div className="filter-group">
                    <label>Price Range</label>
                    <div className="price-inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.min_price || ''}
                            onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        />
                        <span>to</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.max_price || ''}
                            onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        />
                    </div>
                </div>

                {/* Sort Filter */}
                <div className="filter-group">
                    <label>Sort By</label>
                    <select
                        value={filters.sort || 'newest'}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Filters; 