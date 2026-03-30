import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/globals.css";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router";
import App from "./routes/index";
import Login from "./routes/login";
import AuthProvider, { useAuth } from "./lib/auth/authContext";
import ThemeProvider from "./components/ThemeProvider";
import SignUp from "./routes/signup";
import logger from "./lib/logger/logger";

logger.debug("[main.tsx] Starting the app");

export const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <ProtectedRoute />,
        children: [{ index: true, element: <App /> }],
      },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "/login",
    element: (
      <AuthProvider>
        <Login />
      </AuthProvider>
    ),
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
