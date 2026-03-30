import React, { useEffect, useState } from "react";
import { useDocStore } from "../lib/stores/documentStore";
import { Accordion } from "radix-ui";
import { DocumentItem } from "./DocumentItem";
import { findUserDocs } from "../lib/supabase/documents";
import { ensureSession } from "../lib/supabase/auth";
import logger from "../lib/logger/logger";

export function DocumentsSection({ open }: { open: boolean }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //just set currentDocId to first doc for now
  const currentDocId = useDocStore((state: any) => state.currentDocId);
  const setCurrentDocId = useDocStore((state: any) => state.setCurrentDocId);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchDocs = async () => {
      try {
        const session = await ensureSession();

        if (!session) {
          if (mounted) {
            setError("Session expired");
            setLoading(false);
          }
          return;
        }
        const res = await findUserDocs(session.user.id);
        if (mounted) {
          setDocs(res || []);

          //set currentDocId to first doc if not set
          if (res && res.length > 0 && res[0] && !currentDocId) {
            setCurrentDocId(res[0].doc_id);
          }

          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          logger.error("Failed to fetch docs:", err);
          setError(err.message || "Failed to load documents");
          setLoading(false);
        }
      }
    };

    fetchDocs();

    return () => {
      mounted = false;
    };
  }, [currentDocId]);

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Accordion.Root type="single" collapsible defaultValue="docs">
      <Accordion.Item value="docs">
        <Accordion.Header>
          <Accordion.Trigger asChild>
            {open && (
              <div className="relative flex py-5 items-center cursor-pointer">
                <div className="grow border-t border-gray-400"></div>
                <span className="shrink mx-4 text-gray-400">Documents</span>
                <div className="grow border-t border-gray-400"></div>
              </div>
            )}
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
