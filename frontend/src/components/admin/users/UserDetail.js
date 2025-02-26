import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import { FaArrowLeft, FaEdit, FaTrash, FaKey, FaUserCircle, FaEnvelope, FaIdCard, FaUserTag, FaToggleOn } from 'react-icons/fa';
import './Users.css';

function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/users/${id}/`);
            setUser(response.data);
            setEditedUser(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            showNotification('Failed to fetch user details', 'error');
            navigate('/admin/manage-users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            // Only include fields that have changed
            Object.keys(editedUser).forEach(key => {
                if (editedUser[key] !== user[key]) {
                    formData.append(key, editedUser[key]);
                }
            });

            await axios.patch(`/users/${id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            showNotification('User details updated successfully', 'success');
            setIsEditing(false);
            await fetchUserDetails();
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification(error.response?.data?.message || 'Failed to update user details', 'error');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        try {
            // Use the admin password reset endpoint
            const response = await axios.post(`/users/${id}/admin_reset_password/`, {
                new_password: passwordData.new_password
            });
            
            showNotification(response.data.message || 'Password reset successfully', 'success');
            setIsChangingPassword(false);
            setPasswordData({ new_password: '', confirm_password: '' });
        } catch (error) {
            console.error('Error resetting password:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.detail || 
                               error.response?.data?.message || 
                               'Failed to reset password';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`/users/${id}/`);
                showNotification('User deleted successfully', 'success');
                navigate('/admin/manage-users');
            } catch (error) {
                console.error('Error deleting user:', error);
                showNotification(error.response?.data?.message || 'Failed to delete user', 'error');
            }
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    if (loading) return <LoadingBox message="Loading user details..." />;
    if (!user) return null;

    return (
        <div className="user-detail-container">
            {notification && (
                <NotificationBox
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="user-detail">
                <div className="user-detail__header">
                    <div className="header-left">
                        <button 
                            onClick={() => navigate('/admin/manage-users')}
                            className="back-button"
                        >
                            <FaArrowLeft /> Back to Users
                        </button>
                        <h2><FaUserCircle /> User Details</h2>
                    </div>
                    <div className="header-actions">
                        <button 
                            onClick={() => setIsChangingPassword(true)}
                            className="btn-password"
                            title="Change Password"
                        >
                            <FaKey /> Change Password
                        </button>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn-edit"
                            title="Edit User"
                        >
                            <FaEdit /> Edit
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="btn-delete"
                            title="Delete User"
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>

                <div className="user-detail__content">
                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} className="edit-form">
                            <div className="form-group">
                                <label><FaUserCircle /> Username:</label>
                                <input
                                    type="text"
                                    value={editedUser.username || ''}
                                    onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><FaEnvelope /> Email:</label>
                                <input
                                    type="email"
                                    value={editedUser.email || ''}
                                    onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaIdCard /> First Name:</label>
                                    <input
                                        type="text"
                                        value={editedUser.first_name || ''}
                                        onChange={(e) => setEditedUser({...editedUser, first_name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaIdCard /> Last Name:</label>
                                    <input
                                        type="text"
                                        value={editedUser.last_name || ''}
                                        onChange={(e) => setEditedUser({...editedUser, last_name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaUserTag /> Role:</label>
                                    <select
                                        value={editedUser.role || ''}
                                        onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="AUTHOR">Author</option>
                                        <option value="READER">Reader</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><FaToggleOn /> Status:</label>
                                    <select
                                        value={editedUser.is_active?.toString() || 'true'}
                                        onChange={(e) => setEditedUser({...editedUser, is_active: e.target.value === 'true'})}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label><FaUserCircle /> Profile Picture:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditedUser({
                                        ...editedUser,
                                        profile_picture: e.target.files[0]
                                    })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save">Save Changes</button>
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedUser(user);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : isChangingPassword ? (
                        <form onSubmit={handlePasswordChange} className="password-form">
                            <div className="form-group">
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save">Reset Password</button>
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordData({ new_password: '', confirm_password: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="user-info-grid">
                            <div className="user-info-card">
                                <h3><FaUserCircle /> Basic Information</h3>
                                <div className="info-group">
                                    <div className="user-avatar-large">
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
                                    <div className="info-item">
                                        <FaUserCircle /> <strong>Username:</strong>
                                        <span>{user.username}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaEnvelope /> <strong>Email:</strong>
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaIdCard /> <strong>Name:</strong>
                                        <span>{`${user.first_name || '-'} ${user.last_name || '-'}`}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="user-info-card">
                                <h3><FaUserTag /> Account Status</h3>
                                <div className="info-group">
                                    <div className="info-item">
                                        <FaUserTag /> <strong>Role:</strong>
                                        <span className={`role-badge ${(user.role || '').toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <FaToggleOn /> <strong>Status:</strong>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <FaEnvelope /> <strong>Email Verification:</strong>
                                        <span className={`status-badge ${user.is_email_verified ? 'verified' : 'unverified'}`}>
                                            {user.is_email_verified ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDetail; 