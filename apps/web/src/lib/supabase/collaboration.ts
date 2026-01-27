import { supabase } from "./client";

export async function insertYJsUpdates(docId: string, base64Update: string, userId: string) {
      await supabase.from('yjs_updates')
            .insert([{ doc_id: docId, update: base64Update, user_id: userId }]);
}

export async function selectYJsUpdates(docId: string, userId: string) {
      return await supabase.from('yjs_updates')
            .select('update')
            .eq('doc_id', docId)
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
}