import React from 'react';

function CategoryList({ categories }) {
    return (
        <div className="category-list">
            <h2>Categories</h2>
            <ul>
                {categories.map((category) => (
                    <li key={category.id}>{category.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default CategoryList; 