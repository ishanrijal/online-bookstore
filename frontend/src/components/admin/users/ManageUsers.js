import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UsersList from './UsersList';
import UserDetail from './UserDetail';

function ManageUsers() {
    return (
        <Routes>
            <Route index element={<UsersList />} />
            <Route path=":id/*" element={<UserDetail />} />
        </Routes>
    );
}

export default ManageUsers; 