import { useEffect, useRef, useState } from "react";
import { Button, TextField } from "@radix-ui/themes";

export function NewDocument({open} : {open : boolean}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const create = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        //Create document
        setName("");
        setEditing(false);
        triggerRef.current?.focus();
    };

    const cancel = () => {
        setName("");
        setEditing(false);
        triggerRef.current?.focus();
    };

    if (!open) {
        return (<div></div>)
    }

    return (
        <div className="justify-center flex items-center mb-5">
            {!editing ? (
                <Button ref={triggerRef as any} onClick={() => setEditing(true)} aria-haspopup="false">
                    + New Document
                </Button>
            ) : (
                <div className="grid grid-rows-2 gap-4">
                    <div>
                        <TextField.Root
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
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
                        <Button onClick={create} disabled={!name.trim()} className="">
                            Create
                        </Button>
                        <Button onClick={cancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}