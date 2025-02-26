import { FaBook, FaShoppingCart, FaUsers, FaCreditCard } from 'react-icons/fa';

const sidebarLinks = [
    {
        title: 'Manage Orders',
        path: '/admin/manage-orders',
        icon: <FaShoppingCart />
    },
    {
        title: 'Manage Users',
        path: '/admin/manage-users',
        icon: <FaUsers />
    },
    {
        title: 'Manage Payments',
        path: '/admin/manage-payments',
        icon: <FaCreditCard />
    },
]; 