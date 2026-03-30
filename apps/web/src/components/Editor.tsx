import { forwardRef, useEffect, useRef } from "react";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import { SupabaseProvider } from "../lib/supabase/ySupabaseProvider";
import { useDocStore } from "../lib/stores/documentStore";
import "quill/dist/quill.snow.css";

Quill.register("modules/cursors", QuillCursors);

const Editor = forwardRef(({}, ref: any) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const currentDocId: string | any = useDocStore((s) => s.currentDocId);

  useEffect(() => {
    if (!containerRef || !containerRef.current) return;

    const ydoc = new Y.Doc();
    const supaProvider = new SupabaseProvider(currentDocId, ydoc);

    // @ts-ignore
    let quill: Quill;

    supaProvider.init().then(() => {
      const ytext = ydoc.getText("quill");

      containerRef.current!.innerHTML = "";

      const quill = new Quill(containerRef.current!, {
        modules: {
          cursors: true,
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["image", "code-block"],
            [{ list: "check" }],
          ],
          history: {
            userOnly: true,
          },
        },
        placeholder: "Start collaborating...",
        theme: "snow",
      });
      new QuillBinding(ytext, quill, supaProvider.awareness);
      quillRef.current = quill;
      if (ref) ref.current = quill;
    });

    return () => {
      quillRef.current = null;
      if (ref) ref.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [ref, currentDocId]);

  if (!currentDocId) {
    return <div>No current document</div>;
  }

  return (
    <div className="max-sm:mr-3 max-sm:mt-2 md:m-10 max-sm:h-9/12 md:h-5/6 text-">
      <div className="hidden">{currentDocId}</div>
      <div ref={containerRef} className="h-full"></div>
    </div>
  );
});

Editor.displayName = "Editor";

export default Editor;
