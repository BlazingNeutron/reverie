import { useRef } from 'react'
import Editor from '../components/Editor';
import Quill from 'quill'
import "@radix-ui/themes/styles.css";
import { Box, Flex } from '@radix-ui/themes';
import { Sidebar } from '../components/Sidebar';

function App() {
  const quillRef = useRef<Quill | null>(null);

  return (
    <Flex gap="3">
      <Sidebar />
      <Box className='w-full h-screen'>
        <Editor ref={quillRef}/>
      </Box>
    </Flex>
  )
}

export default App
