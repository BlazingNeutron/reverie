import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAuthListener } from '../hooks/useAuthListener';
import { useAuthActions } from '../hooks/useAuthActions';

const AuthContext = createContext(null as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    useAuthListener();
    const { user, session, loading } = useAuthStore();
    const actions = useAuthActions();

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            ...actions
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
