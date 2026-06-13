import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/login/Login';
import Dashboard from './layouts/Dashboard';
import NonAuth from './layouts/NonAuth';
import Root from './layouts/Root';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '',
                element: <Dashboard />,
                children: [
                    {
                        path: '',
                        element: <HomePage />,
                    },
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
