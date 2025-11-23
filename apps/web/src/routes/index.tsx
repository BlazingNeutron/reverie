import { useRef } from 'react'
import Editor from '../Editor.js';
import Quill from 'quill'
import "@radix-ui/themes/styles.css";
import { Box, Flex } from '@radix-ui/themes';
import { useAuth } from '../lib/contexts/auth-context.js';


function App() {
  const auth = useAuth();
  console.log(auth.token);
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
