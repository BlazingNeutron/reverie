import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Login from './login';
import Theme from './theme-provider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

const Routes = () => {
  return <Theme>
        <RouterProvider router={router} />
      </Theme>;
};

export default Routes;