import { supabase } from "./client";

export async function insertYJsUpdates(docId: string, base64Update: string) {
      await supabase.from('yjs_updates')
            .insert([{ doc_id: docId, update: base64Update }]);
}

export async function selectYJsUpdates(docId: string) {
      return await supabase.from('yjs_updates')
            .select('update')
            .eq('doc_id', docId)
            .order('created_at', { ascending: true });
}