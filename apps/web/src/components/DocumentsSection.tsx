import { useEffect, useState } from 'react';
import { SupabaseProvider } from '../lib/supabase/ySupabaseProvider';
import { supabase } from '../lib/supabase/client';
import { useDocStore } from '../lib/stores/documentStore';
import { Accordion } from 'radix-ui';
import { DocumentItem } from './DocumentItem';

export function DocumentsSection({ open }: { open: boolean }) {
  const [docs, setDocs] = useState<any[]>([]);
  //just set currentDocId to first doc for now
  const currentDocId = useDocStore((state: any) => state.currentDocId);
  const setCurrentDocId = useDocStore((state: any) => state.setCurrentDocId);

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
  }, [currentDocId]);

  return (
    <Accordion.Root type="single" collapsible defaultValue="docs">
      <Accordion.Item value="docs">
        <Accordion.Header>
          <Accordion.Trigger asChild>
            {open && <div className="relative flex py-5 items-center cursor-pointer">
              <div className="grow border-t border-gray-400"></div>
              <span className="shrink mx-4 text-gray-400">Documents</span>
              <div className="grow border-t border-gray-400"></div>
            </div>}
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content className="space-y-1 px-2 pb-2">
          {docs.map((doc) => (
            <DocumentItem
              key={doc.doc_id}
              doc={doc}
              open={open}
              isActive={doc.doc_id == currentDocId}
            />
          ))}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}