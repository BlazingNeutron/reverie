
import { useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router";
import { supabase } from "../supabase/client";
import { AuthContext } from "./auth-context";

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState("");

  const handleLogin = async () => {
    const token = await supabase.auth.getUser();

    setToken("" + token.data.user?.email);

    const origin = location.state?.from?.pathname || "/";
    navigate(origin);
  };

  const handleLogout = () => {
    setToken("");
  };

  const value = {
    token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
