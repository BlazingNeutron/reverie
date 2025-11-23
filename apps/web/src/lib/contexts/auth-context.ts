import { createContext, useContext } from "react";

export const AuthContext = createContext<{
  token: string;
  onLogin: () => void;
  onLogout: () => void;
}>({
  token: "",
  onLogin: () => {},
  onLogout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};