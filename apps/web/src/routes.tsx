import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Login from './login';
import { Theme, ThemePanel } from '@radix-ui/themes';

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
  return <Theme><RouterProvider router={router} /><ThemePanel /></Theme>;
};

export default Routes;