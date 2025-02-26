import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import { FaSearch, FaFilter, FaSort, FaEye, FaUserCircle, FaEdit, FaUserEdit } from 'react-icons/fa';
import './Users.css';

function UsersList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [filterVerified, setFilterVerified] = useState('all');
    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotification('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const filteredAndSortedUsers = () => {
        let result = [...users];

        // Apply search filter
        if (searchTerm) {
            result = result.filter(user => 
                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply role filter
        if (filterRole) {
            result = result.filter(user => user.role.toLowerCase() === filterRole.toLowerCase());
        }

        // Apply active status filter
        if (filterActive !== 'all') {
            result = result.filter(user => user.is_active === (filterActive === 'true'));
        }

        // Apply email verification filter
        if (filterVerified !== 'all') {
            result = result.filter(user => user.is_email_verified === (filterVerified === 'true'));
        }

        // Apply sorting
        result.sort((a, b) => {
            let compareA = a[sortField];
            let compareB = b[sortField];

            if (typeof compareA === 'string') {
                return sortDirection === 'asc' 
                    ? compareA.localeCompare(compareB)
                    : compareB.localeCompare(compareA);
            }

            return sortDirection === 'asc' 
                ? compareA - compareB 
                : compareB - compareA;
        });

        return result;
    };

    if (loading) return <LoadingBox message="Loading users..." />;

    return (
        <div className="users-container">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="users-header">
                <h2><FaUserCircle /> Manage Users</h2>
            </div>

            <div className="users-controls">
                <div className="search-box">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by username, email, or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-box">
                    <div className="filter-select-wrapper">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="status-select"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="AUTHOR">Author</option>
                            <option value="READER">Reader</option>
                        </select>
                    </div>
                </div>

                <div className="filter-box">
                    <div className="filter-select-wrapper">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value)}
                            className="status-select"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="filter-box">
                    <div className="filter-select-wrapper">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filterVerified}
                            onChange={(e) => setFilterVerified(e.target.value)}
                            className="status-select"
                        >
                            <option value="all">All Verification</option>
                            <option value="true">Verified</option>
                            <option value="false">Not Verified</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Profile</th>
                            <th onClick={() => handleSort('username')}>
                                Username
                                {sortField === 'username' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('email')}>
                                Email
                                {sortField === 'email' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('first_name')}>
                                First Name
                                {sortField === 'first_name' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('last_name')}>
                                Last Name
                                {sortField === 'last_name' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('role')}>
                                Role
                                {sortField === 'role' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_active')}>
                                Status
                                {sortField === 'is_active' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th onClick={() => handleSort('is_email_verified')}>
                                Email Verified
                                {sortField === 'is_email_verified' && (
                                    <FaSort className={`sort-icon ${sortDirection}`} />
                                )}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedUsers().length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedUsers().map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-avatar">
                                            {user.profile_picture ? (
                                                <img 
                                                    src={user.profile_picture} 
                                                    alt={`${user.username}'s profile`}
                                                    className="profile-image"
                                                />
                                            ) : (
                                                <FaUserCircle className="default-avatar" />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => navigate(`${user.id}`)}
                                            className="username-link"
                                        >
                                            {user.username}
                                        </button>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.first_name || '-'}</td>
                                    <td>{user.last_name || '-'}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_email_verified ? 'verified' : 'unverified'}`}>
                                            {user.is_email_verified ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`${user.id}`)}
                                            title="View User Details"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className="btn-edit"
                                            onClick={() => navigate(`${user.id}/edit`)}
                                            title="Edit User"
                                        >
                                            <FaEdit />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersList; 