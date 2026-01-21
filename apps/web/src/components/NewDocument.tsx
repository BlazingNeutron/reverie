import { Button, TextField } from "@radix-ui/themes";
import { Dialog } from "@radix-ui/themes";
import { Close } from "@radix-ui/themes/components/dialog";

export function NewDocument() {
    return (<div className="justify-center flex items-center mb-5">
        <Dialog.Root>
            <Dialog.Trigger>
                <Button>New Document</Button>
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Title>Create a new document..</Dialog.Title>
                <TextField.Root placeholder="New Document Name">
                    <TextField.Slot></TextField.Slot>
                </TextField.Root>
                <Dialog.Close><Button>Cancel</Button></Dialog.Close>
                <Button>Save</Button>
            </Dialog.Content>
        </Dialog.Root>
    </div>);
}