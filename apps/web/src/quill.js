/* eslint-env browser */

import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { createClient } from '@supabase/supabase-js'
import { SupabaseProvider } from './y-supabase-provider.js'

Quill.register('modules/cursors', QuillCursors)

window.addEventListener('load', () => {
  let baseUrl = window.origin;
  if (baseUrl.indexOf("localhost:5173") >= 0) {
    baseUrl = "http://localhost:8000"
  }
  const supabase = createClient(baseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE");
  const ydoc = new Y.Doc()
  const supaProvider = new SupabaseProvider('my-shared-doc-id', ydoc, supabase);
  const ytext = ydoc.getText('quill')
  const editorContainer = document.createElement('div')
  editorContainer.setAttribute('id', 'editor')
  document.body.insertBefore(editorContainer, null)

  const editor = new Quill(editorContainer, {
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
    theme: 'snow' // or 'bubble'
  })

  const binding = new QuillBinding(ytext, editor, supaProvider.awareness)

  /*
  // Define user name and user name
  // Check the quill-cursors package on how to change the way cursors are rendered
  provider.awareness.setLocalStateField('user', {
    name: 'Typing Jimmy',
    color: 'blue'
  })
  */

  // const connectBtn = document.getElementById('y-connect-btn')
  // connectBtn.addEventListener('click', () => {
  //   if (provider.shouldConnect) {
  //     provider.disconnect()
  //     connectBtn.textContent = 'Connect'
  //   } else {
  //     provider.connect()
  //     connectBtn.textContent = 'Disconnect'
  //   }
  // })

  // @ts-ignore
  //window.example = { provider, ydoc, ytext, binding, Y }
})