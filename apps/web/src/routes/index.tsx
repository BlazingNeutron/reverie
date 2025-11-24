import { useRef } from 'react'
import Editor from '../components/Editor';
import Quill from 'quill'
import "@radix-ui/themes/styles.css";
import { Box, Flex } from '@radix-ui/themes';

function App() {
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
