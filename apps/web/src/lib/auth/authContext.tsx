import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useLocation, useNavigate } from 'react-router';

export type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
};

const defaultValue: AuthContextType = {
    user: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signOut: async () => { },
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) return;
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
            setLoading(false);
        };

        init();

        const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession ?? null);
            setUser(newSession?.user ?? null);
        });

        const subscription = data?.subscription;

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const res = await supabase.auth.signInWithPassword({ email, password });
        if (res.error) return { error: res.error };
        const origin = location.state?.from?.pathname || "/";
        if (origin !== location.pathname) {
            navigate(origin);
        }

        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
