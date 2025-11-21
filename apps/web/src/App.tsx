import { useRef } from 'react'
import Editor from './Editor.jsx';
import Quill from 'quill'
import "@radix-ui/themes/styles.css";
import { Box, Flex } from '@radix-ui/themes';
import { type LoaderFunctionArgs, redirect, useLoaderData } from 'react-router'
import { supabase } from './lib/supabase/client.js';

export const loader = async ({}: LoaderFunctionArgs) => {

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return redirect('/login')
  }

  return data
}

function App() {
  useLoaderData<typeof loader>()
  const quillRef = useRef<Quill | null>(null);

  return (
    <Flex gap="3">
      <Box width="10%">
        <ul><li>Default</li></ul>
      </Box>
      <Box width="90%">
        <Editor
          ref={quillRef}
        />
      </Box>
    </Flex>
  )
}

export default App
