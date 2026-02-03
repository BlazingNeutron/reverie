import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { DocumentsSection } from "./DocumentsSection";
import { NewDocument } from "./NewDocument";

export function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="h-screen"
    >
      <aside
        className={`flex h-full flex-col border-r bg-gray-900 text-white transition-all duration-300
          ${open ? "max-sm:w-80 md:w-72" : "max-sm:w-0 md:w-16"}
        `}
      >
        <SidebarHeader open={open} />

        <nav className="flex-1 overflow-y-auto">
          <NewDocument open={open} />
          <DocumentsSection open={open} />
        </nav>
      </aside>
    </Collapsible.Root>
  );
}

function SidebarHeader({ open }: { open: boolean }) {
  return (
    <div className="flex items-center justify-between p-4">
      {open && <span className="md:hidden font-semibold">Reverie Notes</span>}

      <Collapsible.Trigger asChild>
        <button className="rounded p-2 hover:bg-gray-800 z-5">☰</button>
      </Collapsible.Trigger>
    </div>
  );
}
