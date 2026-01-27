import { useEffect } from 'react'
import { supabase } from '../supabase/client'
import { useAuthStore } from '../stores/authStore'

export function useAuthListener() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setAuth(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setAuth(session)
      else clearAuth()
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])
}
