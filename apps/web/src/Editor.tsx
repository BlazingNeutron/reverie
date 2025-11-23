import { forwardRef, useEffect, useRef } from 'react';
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { SupabaseProvider } from './y-supabase-provider.js'
import { supabase } from './lib/supabase/client.js'

Quill.register('modules/cursors', QuillCursors);

// Editor is an uncontrolled React component
const Editor = forwardRef(({}, ref : any) => {
    const containerRef = useRef(null);
   
    useEffect(() => {
      
      const ydoc = new Y.Doc()
      const supaProvider = new SupabaseProvider('my-shared-doc-id', ydoc, supabase);
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
            ['image', 'code-block']
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
    }, [ref]);

    return <div ref={containerRef}></div>;
  },
);

Editor.displayName = 'Editor';

export default Editor;