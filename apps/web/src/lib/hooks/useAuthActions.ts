import { useLocation, useNavigate } from 'react-router'
import { supabase } from '../supabase/client'

export function useAuthActions() {
    const navigate = useNavigate()
    const location = useLocation()

    const signIn = async (email: string, password: string) => {
        const res = await supabase.auth.signInWithPassword({ email, password })
        if (res.error) return { error: res.error }

        const origin = location.state?.from?.pathname || '/'
        if (origin !== location.pathname) {
            navigate(origin)
        }

        return { error: null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return { signIn, signOut }
}
