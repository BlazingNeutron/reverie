import React, { useRef } from "react";
import Editor from "../components/Editor";
import Quill from "quill";
import "@radix-ui/themes/styles.css";
import { Box, Flex } from "@radix-ui/themes";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useDocStore } from "../lib/stores/documentStore";

function App() {
  const quillRef = useRef<Quill | null>(null);
  const currentDocId: string | any = useDocStore((s) => s.currentDocId);

  return (
    <Flex gap="3">
      <Sidebar />
      <Box className="w-full h-screen">
        <Header />
        <Editor ref={quillRef} key={currentDocId} />
      </Box>
    </Flex>
  );
}

export default App;
