import Wishlist from '../components/dashboard/Wishlist';

const dashboardRoutes = [
    {
        path: '',
        element: <DashboardOverview />
    },
    {
        path: 'wishlist',
        element: <Wishlist />
    }
]; 