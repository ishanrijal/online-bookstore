import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryAPI } from '../../../utils/axios';
import LoadingBox from '../../common/LoadingBox';
import NotificationBox from '../../common/NotificationBox';
import LoaderModal from '../../common/LoaderModal';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const response = await categoryAPI.getCategory(id);
            setFormData({
                name: response.data.name,
                description: response.data.description || '',
            });
        } catch (err) {
            console.error('Error fetching category:', err);
            const errorMessage = err.response?.data?.message || 'Failed to fetch category details';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                await categoryAPI.updateCategory(id, formData);
                showNotification('Category updated successfully', 'success');
            } else {
                await categoryAPI.createCategory(formData);
                showNotification('Category created successfully', 'success');
            }
            // Wait for notification to be visible before redirecting
            setTimeout(() => {
                navigate('/admin/manage-categories');
            }, 1500);
        } catch (err) {
            console.error('Error saving category:', err);
            const errorMessage = err.response?.data?.message || 
                               'Failed to ' + (isEditMode ? 'update' : 'create') + ' category';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingBox message="Loading category details..." />;

    return (
        <div className="edit-book">
            {notification && (
                <NotificationBox 
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            
            {saving && <LoaderModal message={isEditMode ? "Updating category..." : "Creating category..."} />}
            
            <div className="edit-book__header">
                <h2>{isEditMode ? 'Edit Category' : 'Add New Category'}</h2>
                <button onClick={() => navigate('/admin/manage-categories')} className="close-button">
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="edit-book__form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Category Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                            placeholder="Enter category name"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            rows="4"
                            placeholder="Enter category description"
                            disabled={saving}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/manage-categories')}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={saving}
                    >
                        {saving ? 
                            `${isEditMode ? 'Updating...' : 'Creating...'}` : 
                            (isEditMode ? 'Update Category' : 'Create Category')
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm; 