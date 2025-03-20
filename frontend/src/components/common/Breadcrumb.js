import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('/dashboard');
    const isHome = location.pathname === '/';

    if (isDashboard || isHome) return null;

    return (
        <div className="breadcrumb-container">
            <div className="container">
                <nav className="breadcrumb">
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                           
                            {index === items.length - 1 ? (
                                <span className="breadcrumb-item active">{item.label}</span>
                            ) : (
                                <Link to={item.path} className="breadcrumb-item">{item.label}</Link>
                            )}
                             <FaChevronRight className="breadcrumb-separator" />
                        </React.Fragment>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Breadcrumb; 