import * as Tooltip from "@radix-ui/react-tooltip";
import { useDocStore } from '../lib/stores/documentStore';

export function DocumentItem({
  doc,
  open,
  isActive,
}: {
  doc: {
    doc_id: string,
    title: string
  };
  open: boolean;
  isActive: boolean;
}) {
  const setCurrentDocId = useDocStore((state: any) => state.setCurrentDocId);

  const handleDocChange = (docId?: string) => () => {
    setCurrentDocId(docId);
  }
  const baseStyles = `
    group relative w-full rounded-md transition
    ${isActive ? "bg-gray-800" : "hover:bg-gray-800"}
  `;

  if (!open) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild onClick={handleDocChange(doc.doc_id)}>
          <button className={`${baseStyles} flex h-10 items-center justify-center`}>
            📄
            <StatusDot isActive={isActive} />
          </button>
        </Tooltip.Trigger>

        <Tooltip.Content
          side="right"
          className="rounded bg-gray-800 p-3 text-xs shadow"
        >
          <div className="font-medium">{doc.title}</div>
          {isActive && <div className="text-gray-400">
             editing
          </div>}
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  return (
    <button className={`${baseStyles} p-3 text-left`} onClick={handleDocChange(doc.doc_id)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{doc.title}</span>
        <span className="text-xs text-gray-400">
          {isActive && <div className="text-gray-400">
             editing
          </div>}
        </span>
      </div>
    </button>
  );
}

function StatusDot({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-400" />
  );
}
