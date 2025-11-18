import { useState, useRef } from 'react'
import Editor from './Editor.jsx';
import Quill from 'quill'

const Delta = Quill.import('delta');

function App() {
  const [count, setCount] = useState(0)
  const quillRef = useRef();

  return (
    <div>
      <Editor
        ref={quillRef}
      />
    </div>
  )
}

export default App
