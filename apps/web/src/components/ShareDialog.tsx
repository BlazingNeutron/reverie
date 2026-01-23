import { Dialog } from "radix-ui";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

export function ShareDialog() {

    return (<Dialog.Root>
		<Dialog.Trigger asChild>
			<button className="inline-flex h-[35px] items-center justify-center rounded bg-violet4 px-[15px] font-medium leading-none text-violet11 outline-none outline-offset-1 hover:bg-mauve3 focus-visible:outline-2 focus-visible:outline-violet6 select-none">
				Share
			</button>
		</Dialog.Trigger>

        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60  data-[state=open]:animate-overlayShow" />
            <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md dark:bg-gray-900 light: p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
                <Dialog.Title className="text-lg font-semibold dark:text-white">
                    Share this document
                </Dialog.Title>

                <Dialog.Description className="mt-1 text-sm text-neutral-500">
                    Invite people to collaborate on this document.
                </Dialog.Description>

                <div className="mt-4 space-y-4">

                    <input type="text" placeholder="Search by name or email" className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400" />
                    <div className="space-y-2">
                        <UserRow name="Alice" />
                        <UserRow name="Bob" />
                        <UserRow name="Charlie" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Dialog.Close asChild>
                        <button className="rounded-md px-3 py-1 text-sm bg-neutral-900 light:hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            Cancel
                        </button>
                    </Dialog.Close>

                    <Dialog.Close asChild>
                        <button className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-white hover:bg-neutral-800">
                            Done
                        </button>
                    </Dialog.Close>
                </div>
                <Dialog.Close asChild>
					<button
						className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
						aria-label="Close"
					>
						<Cross2Icon />
					</button>
				</Dialog.Close>

            </Dialog.Content>
        </Dialog.Portal>
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

            <button className="text-sm text-neutral-700 hover:underline">
                <CheckIcon />
            </button>
        </div>
    );
}