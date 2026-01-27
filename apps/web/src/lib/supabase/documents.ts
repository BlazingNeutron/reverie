import { supabase } from "./client";

export async function selectDocument(docId: string) {
    return await supabase.from('documents')
        .select('doc_id, title, content, user_id')
        .eq('doc_id', docId);
}

export async function updateDocumentSearch(docId: string, title: string, content: string, userId: string) {
    await supabase.from('documents').upsert({
        doc_id: docId,
        title: title,
        content: content,
        user_id: userId
    });
}

export async function findUserDocs(userId: string) {
    const { data: shared, error } = await supabase
        .from('shared')
        .select('doc_id')
        .eq('user_id', userId);
    if (!shared) return [];
    const doc_ids = shared.map((sharedDoc) => sharedDoc.doc_id);
    
    const { data: docList, error: docError } = await supabase
        .from('documents')
        .select('doc_id, title, user_id')
        .in('doc_id', doc_ids)
        .order('title', { ascending: false });

    if (docError) {
        console.error("Error fetching user docs:", error);
        return [];
    }

    return docList || [];
}

export async function createDocument(title: string, userId: string | any) {
    if (!userId) return;
    const { data } = await supabase
        .from('documents')
        .insert({
            "title": title,
            "user_id": userId
        }).select();

    if (data && data.length > 0 && data[0]) {
        return data[0].doc_id;
    }
    return null;
}