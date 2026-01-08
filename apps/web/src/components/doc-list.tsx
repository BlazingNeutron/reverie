import { useEffect, useState } from 'react';
import { SupabaseProvider } from '../lib/supabase/y-supabase-provider';
import { supabase } from '../lib/supabase/client';

export default function DocList() {
    const [docs, setDocs] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        const provider = new SupabaseProvider('doc-list-doc-id', {} as any, supabase);

        provider
            .findUserDocs()
            .then((res: any) => {
                if (mounted) setDocs(res || []);
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
                    <li key={doc.id}>{doc.title || 'Untitled Document'}</li>
                ))}
            </ol>
        </div>
    );
}