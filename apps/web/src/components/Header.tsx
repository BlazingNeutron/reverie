import { Dialog, DropdownMenu } from "@radix-ui/themes";
import { CheckIcon } from '@radix-ui/react-icons';
import { useAuth } from '../lib/auth/authContext';

export function Header() {
    const { user, signOut } = useAuth();

    const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? '';
    const initial = name ? name.charAt(0).toUpperCase() : 'A';

    return (<header className="h-14 border-b light:bg-white flex gap-2 justify-end px-4">
        <div className="flex items-center gap-3">

            <Dialog.Root>
                <Dialog.Trigger>
                    <button className="rounded-md border px-2 py-1 text-sm light:hover:bg-neutral-100 dark:hover:bg-gray-800 dark:bg-gray-900">
                        Share
                    </button>
                </Dialog.Trigger>


                <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg p-5focus:outline-none">
                    <Dialog.Title className="text-lg font-semibold">
                        Share this document
                    </Dialog.Title>

                    <Dialog.Description className="mt-1 text-sm text-neutral-500">
                        Invite people to collaborate on this document.
                    </Dialog.Description>

                    <div className="mt-4 space-y-4">
                        <input type="text" placeholder="Search by name or email" className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"/>
                        <div className="space-y-2">
                            <UserRow name="Alice" />
                            <UserRow name="Bob" />
                            <UserRow name="Charlie" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Dialog.Close>
                            <button className="rounded-md px-3 py-1 text-sm bg-neutral-900 light:hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                Cancel
                            </button>
                        </Dialog.Close>

                        <Dialog.Close>
                            <button className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-white hover:bg-neutral-800">
                                Done
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Root>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <button className="h-9 w-9 rounded-full light:bg-neutral-900 dark:bg-gray-900 border text-white flex items-center justify-center text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                        aria-label="User menu">
                        {initial}
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content align="end" className="light:bg-white rounded-md shadow-md text-sm">
                    <DropdownMenu.Item className="light:hover:bg-neutral-100 rounded" onClick={signOut}>
                        Logout
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    </header>);
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
                <CheckIcon/>
            </button>
        </div>
    );
}