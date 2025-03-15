import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { cartAPI } from '../../utils/axios';
import { formatPrice } from '../../utils/cartUtils';
import { FaShoppingBag, FaStar, FaShoppingCart, FaRupeeSign, FaBook, FaChartLine } from 'react-icons/fa';
import NotificationBox from '../common/NotificationBox';
import LoaderModal from '../common/LoaderModal';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css';

const DashboardOverview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalReviews: 0,
        cartItems: 0,
        totalBooks: 0,
        totalBooksSold: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (user.role === 'Author') {
                // Get all books and filter for the author's books
                const booksResponse = await axios.get('/books/', {
                    params: {
                        authors: user.id
                    }
                });

                // Get recommendations which will serve as popular books
                const recommendationsResponse = await axios.get('/books/recommendations/', {
                    params: {
                        author: user.id
                    }
                });

                // Get reviews for author's books
                const authorBooks = booksResponse.data.filter(book => 
                    book.authors.some(author => author.user === user.id)
                );
                
                const bookIds = authorBooks.map(book => book.id);
                const reviewsResponse = await axios.get('/reviews/reviews/', {
                    params: {
                        book__in: bookIds.join(',')
                    }
                });

                const totalSales = authorBooks.reduce((total, book) => total + (book.sales_count || 0), 0);

                setStats({
                    totalBooks: authorBooks.length,
                    totalBooksSold: totalSales,
                    totalReviews: reviewsResponse.data.length
                });

                // Set top 5 popular books
                const topBooks = recommendationsResponse.data
                    .filter(book => book.authors.some(author => author.user === user.id))
                    .slice(0, 5);

                setPopularBooks(topBooks.map(book => ({
                    ...book,
                    total_sales: book.sales_count || 0,
                    average_rating: book.average_rating || 0
                })));

            } else if (user.role === 'Publisher') {
                // Get publisher's books
                const booksResponse = await axios.get('/books/', {
                    params: {
                        publisher: user.id
                    }
                });

                // Get reviews for publisher's books
                const publisherBooks = booksResponse.data;
                const bookIds = publisherBooks.map(book => book.id);
                const reviewsResponse = await axios.get('/reviews/reviews/', {
                    params: {
                        book__in: bookIds.join(',')
                    }
                });

                setStats({
                    totalBooks: publisherBooks.length,
                    totalReviews: reviewsResponse.data.length
                });

            } else {
                // Regular user (Reader) dashboard data fetching
                const [cartResponse, ordersRes, reviewsRes] = await Promise.all([
                    cartAPI.getCurrentCart(),
                    axios.get('/orders/orders/'),
                    axios.get(`/reviews/reviews/user/${user.id}`)
                ]);

                setStats({
                    totalOrders: ordersRes.data.length,
                    totalReviews: reviewsRes.data.length,
                    cartItems: cartResponse.data.items?.length || 0
                });

                const sortedOrders = ordersRes.data.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setRecentOrders(sortedOrders.slice(0, 3));
            }
        } catch (error) {
            console.error('Error in dashboard data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
                return;
            }
            setNotification({
                type: 'error',
                message: 'Some dashboard data could not be loaded'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await axios.post(`/orders/orders/${orderId}/cancel/`);
            setNotification({
                type: 'success',
                message: 'Order cancelled successfully'
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error cancelling order:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to cancel order'
            });
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'status--pending';
            case 'PAID':
                return 'status--delivered';
            case 'CANCELLED':
                return 'status--cancelled';
            case 'DELIVERED':
                return 'status--delivered';
            default:
                return 'status--processing';
        }
    };

    if (loading) {
        return <LoaderModal message="Loading your dashboard..." />;
    }

    return (
        <div className="dashboard-overview">
            {notification.message && (
                <NotificationBox 
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ type: '', message: '' })}
                />
            )}

            <h2>Dashboard Overview</h2>
            
            <div className="stats-grid">
                {user.role === 'Author' ? (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaBook />
                            </div>
                            <div className="stat-details">
                                <h3>Total Books</h3>
                                <p>{stats.totalBooks}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaChartLine />
                            </div>
                            <div className="stat-details">
                                <h3>Total Books Sold</h3>
                                <p>{stats.totalBooksSold}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaShoppingBag />
                            </div>
                            <div className="stat-details">
                                <h3>Total Orders</h3>
                                <p>{stats.totalOrders}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaStar />
                            </div>
                            <div className="stat-details">
                                <h3>Reviews</h3>
                                <p>{stats.totalReviews}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaShoppingCart />
                            </div>
                            <div className="stat-details">
                                <h3>Cart Items</h3>
                                <p>{stats.cartItems}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {user.role === 'Author' ? (
                <div className="popular-books">
                    <div className="popular-books__header">
                        <h3>Top Popular Books</h3>
                        <Link to="/dashboard/manage-books" className="view-all">
                            View All Books
                        </Link>
                    </div>
                    
                    {popularBooks.length === 0 ? (
                        <div className="no-books">
                            <p>No books found</p>
                        </div>
                    ) : (
                        <div className="books-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>ISBN</th>
                                        <th>Total Sales</th>
                                        <th>Rating</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {popularBooks.map(book => (
                                        <tr key={book.id}>
                                            <td>
                                                <Link to={`/dashboard/manage-books/${book.id}`}>
                                                    {book.title}
                                                </Link>
                                            </td>
                                            <td>{book.isbn}</td>
                                            <td>{book.total_sales || 0}</td>
                                            <td>{book.average_rating || 'N/A'}</td>
                                            <td className="amount">
                                                <FaRupeeSign className="rupee-icon" />
                                                {formatPrice(book.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="recent-orders">
                    <div className="recent-orders__header">
                        <h3>Recent Orders</h3>
                        <Link to="/dashboard/orders" className="view-all">
                            View All Orders
                        </Link>
                    </div>
                    
                    {recentOrders.length === 0 ? (
                        <div className="no-orders">
                            <p>No orders found</p>
                        </div>
                    ) : (
                        <div className="orders-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <Link to={`/dashboard/orders/${order.id}`}>
                                                    #{order.id}
                                                </Link>
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status ${getStatusBadgeClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="amount">
                                                <FaRupeeSign className="rupee-icon" />
                                                {formatPrice(order.total_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardOverview; 