import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/login/Login';
import Dashboard from './layouts/Dashboard';
import NonAuth from './layouts/NonAuth';
import Root from './layouts/Root';
import Users from './pages/users/Users';
import Restaurants from './pages/restaurants/Restaurants';
import Products from './pages/products/Products';
import Orders from './pages/orders/Orders';
import Promos from './pages/promos/Promos';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '',
                element: <Dashboard />,
                children: [
                    { path: '', element: <HomePage /> },
                    { path: '/users', element: <Users /> },
                    { path: '/restaurants', element: <Restaurants /> },
                    { path: '/products', element: <Products /> },
                    { path: '/orders', element: <Orders /> },
                    { path: '/promos', element: <Promos /> },
                ],
            },
            {
                path: '/auth',
                element: <NonAuth />,
                children: [
                    {
                        path: 'login',
                        element: <Login />,
                    },
                ],
            },
        ],
    },
]);

export default router;
