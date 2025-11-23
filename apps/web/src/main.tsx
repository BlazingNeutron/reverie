import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import RootLayout from './layout';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router';
import App from './routes/index';
import Login from './routes/login';
import { useAuth } from './lib/contexts/auth-context';
import { AuthProvider } from './lib/contexts/auth-provider';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  console.log("Protected Route")
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider><ProtectedRoute><App /></ProtectedRoute></AuthProvider>,
  },
  {
    path: "/login",
    element: <AuthProvider><Login /></AuthProvider>
  }   
]);

root.render(
  <React.StrictMode>
    <RootLayout>
      <RouterProvider router={router} />
    </RootLayout>
  </React.StrictMode>
);