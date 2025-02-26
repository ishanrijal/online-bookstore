import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import LoaderModal from '../common/LoaderModal';
import NotificationBox from '../common/NotificationBox';
import '../../sass/components/_profile.sass';

const Profile = () => {
    const auth = useAuth();
    const { user } = auth;
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        profile_picture: null
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username || '',
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                address: user.address || '',
            }));
            setPreviewImage(null);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                profile_picture: file
            }));
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ type: '', message: '' });

        try {
            const formDataToSend = new FormData();
            
            // Only append changed fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && 
                    formData[key] !== '' && (key === 'profile_picture' || formData[key] !== user[key])) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const response = await axios.patch('/users/profile/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                setPreviewImage(null);
                
                setNotification({
                    type: 'success',
                    message: 'Profile updated successfully!'
                });
                setIsEditing(false);
                
                // Refresh the page after successful update
                window.location.reload();
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setNotification({ type: '', message: '' });
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            setNotification({
                type: 'error',
                message: 'Passwords do not match'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/users/change_password/', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            if (response.status === 200) {
                setNotification({
                    type: 'success',
                    message: 'Password changed successfully!'
                });

                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }
        } catch (error) {
            console.error('Password change error:', error);
            if (!error.response || error.response.status !== 200) {
                setNotification({
                    type: 'error',
                    message: error.response?.data?.detail || 
                            error.response?.data?.message || 
                            'Failed to change password'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            {loading && <LoaderModal message="Updating profile..." />}
            
            {notification.message && (
                <NotificationBox 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <div className="profile-header">
                <h2>Profile Settings</h2>
                <button 
                    className="edit-button"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-info">
                    <div className="profile-picture-container">
                        <div className="profile-picture">
                            {previewImage ? (
                                <img src={previewImage} alt={user?.username} />
                            ) : user?.profile_picture ? (
                                <img src={user.profile_picture} alt={user.username} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                                </div>
                            )}
                            {isEditing && (
                                <div className="profile-picture-overlay">
                                    <label htmlFor="profile-picture-input" className="update-picture-label">
                                        <i className="fas fa-camera"></i>
                                        Update Photo
                                    </label>
                                    <input 
                                        id="profile-picture-input"
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="profile-picture-input"
                                        hidden
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                <div className="password-section">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="change-password-button"
                            disabled={loading}
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile; 