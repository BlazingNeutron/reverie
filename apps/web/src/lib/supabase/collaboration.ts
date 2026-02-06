import { supabase } from "./client";

export async function insertYJsUpdates(docId: string, base64Update: string) {
      return await supabase.from('yjs_updates')
            .insert([{ doc_id: docId, update: base64Update }]).select();
}

export async function selectYJsUpdates(docId: string) {
      return await supabase.from('yjs_updates')
            .select('update')
            .eq('doc_id', docId)
            .order('created_at', { ascending: true });
}

export async function upsertYJsSnapshot(docId: string, base64Snapshot: string) {
      const { data } = await supabase.from('yjs_snapshots')
            .upsert({ doc_id: docId, snapshot: base64Snapshot })
            .select();
      return data && data.length > 0 ? data[0] : null;
}

export async function selectYJsSnapshot(docId: string) {
      return await supabase.from('yjs_snapshots')
            .select('snapshot, created_at')
            .eq('doc_id', docId)
            .order('created_at', {
                  ascending: false
            })
            .limit(1);
}

export async function selectYJsUpdatesSince(docId: string, since: string) {
      return await supabase.from('yjs_updates')
            .select('update')
            .eq('doc_id', docId)
            .gt('created_at', since)
            .order('created_at', { 
                  ascending: true 
            });
}

export async function deleteYJsUpdatesBefore(docId: string, before: string) {
      return await supabase.from('yjs_updates')
            .delete()
            .lt('created_at', before)
            .eq('doc_id', docId);
}