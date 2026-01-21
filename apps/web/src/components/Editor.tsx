import { forwardRef, useEffect, useRef } from 'react';
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { SupabaseProvider } from '../lib/supabase/y-supabase-provider'
import { supabase } from '../lib/supabase/client';
import { useDocStore } from '../lib/stores/doc-store';
import 'quill/dist/quill.snow.css';

Quill.register('modules/cursors', QuillCursors);

const Editor = forwardRef(({}, ref : any) => {
    const containerRef = useRef(null);
    const currentDocId : string | any= useDocStore((s) => s.currentDocId);
    useEffect(() => {
      
      const ydoc = new Y.Doc()
      const supaProvider = new SupabaseProvider(supabase);
      supaProvider.setDoc(currentDocId, ydoc);
      const ytext = ydoc.getText('quill')

      if (!containerRef || !containerRef.current) return;
      const container : HTMLElement = containerRef.current;
      
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div'),
      );
      const quill = new Quill(editorContainer, {
        modules: {
          cursors: true,
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block'],
            [{ "list": "check" }]
          ],
          history: {
            userOnly: true
          }
        },
        placeholder: 'Start collaborating...',
        theme: 'snow',
      });
      new QuillBinding(ytext, quill, supaProvider.awareness)
      ref.current = quill;

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref, currentDocId]);

    return (<div><div className='hidden'>{currentDocId}</div><div ref={containerRef} className='mt-10'></div></div>);
  },
);

Editor.displayName = 'Editor';

export default Editor;