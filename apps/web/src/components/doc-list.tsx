import { useEffect, useState } from 'react';
import { SupabaseProvider } from '../lib/supabase/y-supabase-provider';
import { supabase } from '../lib/supabase/client';
import { useDocStore } from '../lib/state';

export default function DocList() {
    const [docs, setDocs] = useState<any[]>([]);
    //just set currentDocId to first doc for now
    const currentDocId = useDocStore((state : any) => state.currentDocId);
    const setCurrentDocId = useDocStore((state : any) => state.setCurrentDocId);

    useEffect(() => {
        let mounted = true;
        const provider = new SupabaseProvider(supabase);

        provider
            .findUserDocs()
            .then((res: any) => {
                if (mounted) setDocs(res || []);
                //set currentDocId to first doc if not set
                if (mounted && res && res.length > 0 && !currentDocId) {
                    setCurrentDocId(res[0].doc_id);
                }
            })
            .catch(() => {
                if (mounted) setDocs([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div>
            <ol>
                {docs.map((doc: any) => (
                    <li key={doc.doc_id} style={doc.doc_id === currentDocId ? { fontWeight: 'bold' } : {}}>{doc.title || 'Untitled Document'}</li>
                ))}
            </ol>
        </div>
    );
}