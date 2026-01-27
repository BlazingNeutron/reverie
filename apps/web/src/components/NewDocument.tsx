import { useEffect, useRef, useState } from "react";
import { Button, TextField } from "@radix-ui/themes";
import { useDocStore } from "../lib/stores/documentStore";
import { createDocument } from "../lib/supabase/documents";
import { useAuthStore } from "../lib/stores/authStore";

export function NewDocument({open} : {open : boolean}) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setCurrentDocId = useDocStore((state: any) => state.setCurrentDocId);
    const { user } = useAuthStore();

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const create = async () => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const newDocId = createDocument(trimmed, user?.id)
        setCurrentDocId(newDocId);
        setTitle("");
        setEditing(false);
        triggerRef.current?.focus();
    };

    const cancel = () => {
        setTitle("");
        setEditing(false);
        triggerRef.current?.focus();
    };

    if (!open) {
        return (<div></div>)
    }

    return (
        <div className="justify-center flex items-center mb-5">
            {!editing ? (
                <Button ref={triggerRef as any} onClick={() => setEditing(true)}>
                    New Document
                </Button>
            ) : (
                <div className="grid grid-rows-2 gap-4">
                    <div>
                        <TextField.Root
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled document"
                            aria-label="New document name"
                            className="w-full"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    create();
                                }
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    cancel();
                                }
                            }}>
                        </TextField.Root>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={create} disabled={!title.trim()}>
                            Create
                        </Button>
                        <Button onClick={cancel} variant="outline">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}