import { supabase } from "./client";

export async function ensureSession() {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    return session;
}