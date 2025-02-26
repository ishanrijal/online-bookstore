import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentsList from './PaymentsList';
import PaymentDetail from './PaymentDetail';

function ManagePayments() {
    return (
        <Routes>
            <Route index element={<PaymentsList />} />
            <Route path=":id" element={<PaymentDetail />} />
        </Routes>
    );
}

export default ManagePayments; 