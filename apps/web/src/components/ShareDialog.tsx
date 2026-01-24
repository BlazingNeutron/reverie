import { Dialog } from "radix-ui";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

export function ShareDialog() {

    return (
        <Dialog.Root >
            <Dialog.Trigger asChild>
                <Button>Share</Button>
            </Dialog.Trigger>
            <Dialog.Overlay className="fixed inset-0 bg-black/60  data-[state=open]:animate-overlayShow" />
            <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] bg-background -translate-x-1/2 -translate-y-1/2 rounded-md p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                <Dialog.Title className="text-lg font-semibold dark:text-white">
                    Share this document
                </Dialog.Title>

                <Dialog.Description className="mt-1 text-sm text-neutral-500">
                    Invite people to collaborate on this document.
                </Dialog.Description>

                <div className="mt-4 space-y-4">
                    {/* <TextField.Root type="text" placeholder="Search by name or email"/> */}
                    <div className="space-y-2 overflow-y-scroll">
                        <UserRow name="Alice" />
                        <UserRow name="Bob" />
                        <UserRow name="Charlie" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-8">
                    <Dialog.Close asChild>
                        <Button variant="solid"
                            aria-label="Done">Done</Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                        <Button variant="outline" aria-label="Cancel">Cancel</Button>
                    </Dialog.Close>
                </div>
                <Dialog.Close asChild>
                    <button className="absolute right-2.5 top-2.5 inline-flex size-[25px] items-center justify-center rounded-full bg-gray-200 dark:bg-gray-500 hover:bg-accent focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                        aria-label="Close" type="button">
                        <Cross2Icon />
                    </button>
                </Dialog.Close>
            </Dialog.Content>
        </Dialog.Root>);
}

function UserRow({ name }: { name: string }) {
    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center text-sm font-medium">
                    {name.charAt(0)}
                </div>
                <span className="text-sm">{name}</span>
            </div>

            <Button>
                Add <CheckIcon />
            </Button>
        </div>
    );
}