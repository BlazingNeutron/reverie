import { useRef } from 'react'
import Editor from '../components/Editor';
import Quill from 'quill'
import "@radix-ui/themes/styles.css";
import { Box, Flex } from '@radix-ui/themes';
import DocList from '../components/doc-list';

function App() {
  const quillRef = useRef<Quill | null>(null);

  return (

    <Flex gap="3">

      <Box width="10%">
        <DocList />
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
