import { supabase } from "./client";

export async function shareDocument(docId: string, userId: string) {
    await supabase
        .from('shared')
        .insert({
            "doc_id": docId,
            "user_id": userId
        });
}

export async function unshareDocument(docId: string, userId: string) {
    await supabase
        .from('shared')
        .delete()
        .eq("doc_id", docId)
        .eq("user_id", userId);
}

export async function findCollaborators(docId: string, userId: string | any) {
    const { data: profiles, error: profileErrors } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .neq('user_id', userId);
    if (!profiles) {
        return [];
    }
    if (profileErrors) {
        console.error("Error fetching collaborators:", profileErrors);
        return [];
    }
    const user_ids = profiles.map((profile) => profile.user_id);
    const { data: shares, error: sharesErrors } = await supabase
        .from('shared')
        .select('user_id')
        .eq('doc_id', docId)
        .in('user_id', user_ids);
    const collaborators = profiles.map((profile) => {
        const isShared = shares?.some(share => share.user_id === profile.user_id);
        return {
            user_id: profile.user_id,
            display_name: profile.display_name,
            is_shared: isShared
        }
    });
    if (sharesErrors) {
        console.error("Error fetching collaborators:", sharesErrors);
        return [];
    }

    return collaborators;
}