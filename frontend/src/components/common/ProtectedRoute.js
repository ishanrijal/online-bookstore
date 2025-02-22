import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect to login but save the location they tried to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if route requires admin role
    if (roles.includes('ADMIN') && user.role !== 'ADMIN') {
        // If user is not admin, redirect to regular dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // If route requires regular user and user is admin, redirect to admin dashboard
    if (!roles.includes('ADMIN') && user.role === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute; 