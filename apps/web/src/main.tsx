import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router';
import App from './routes/index';
import Login from './routes/login';
import AuthProvider, { useAuth } from './lib/auth/authContext.tsx';
import ThemeProvider from './components/ThemeProvider.tsx';

export const ProtectedRoute = () => {
  const { session, loading } = useAuth();  
  if (loading) return null; // or a spinner
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <App /> },
        ],
      },
      { path: 'login', element: <Login /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);