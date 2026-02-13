import { forwardRef, useEffect, useRef } from "react";
import * as Y from "yjs"
import { QuillBinding } from "y-quill"
import Quill from "quill"
import QuillCursors from "quill-cursors"
import QuillResizeImage from 'quill-resize-image';
import { SupabaseProvider } from "../lib/supabase/ySupabaseProvider"
import { useDocStore } from "../lib/stores/documentStore";
import "quill/dist/quill.snow.css";

Quill.register("modules/cursors", QuillCursors);
Quill.register("modules/resize", QuillResizeImage);

const Editor = forwardRef(({ }, ref: any) => {
  const containerRef = useRef(null);
  const currentDocId: string | any = useDocStore((s) => s.currentDocId);
  useEffect(() => {

    const ydoc = new Y.Doc();
    const supaProvider = new SupabaseProvider(currentDocId, ydoc);

    if (!containerRef || !containerRef.current) return;
    const container: HTMLElement = containerRef.current;

    supaProvider.init().then(()=>{
      const ytext = ydoc.getText("quill");
      
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );
      const quill = new Quill(editorContainer, {
        modules: {
          cursors: true,
          toolbar: [
            [{ "header": [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["image", "code-block"],
            [{ "list": "check" }]
          ],
          history: {
            userOnly: true
          },
          resize: {
            locale: {},
          },
        },
        placeholder: "Start collaborating...",
        theme: "snow",
        formats: [
          'image',
        ],
      });
      new QuillBinding(ytext, quill, supaProvider.awareness);
      ref.current = quill;
    });

    return () => {
      ref.current = null;
      container.innerHTML = "";
    };
  }, [ref, currentDocId]);

  if (!currentDocId) {
    return (<div>No current document</div>)
  }

  return (<div className="max-sm:mr-3 max-sm:mt-2 md:m-10 max-sm:h-9/12 md:h-5/6 text-">
    <div className="hidden">{currentDocId}</div>
    <div ref={containerRef} className="h-full"></div>
  </div>);
},
);

Editor.displayName = "Editor";

export default Editor;