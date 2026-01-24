import { DropdownMenu } from '@radix-ui/themes';
import { useAuth } from '../lib/auth/authContext';

export function UserMenu() {
    const { user, signOut } = useAuth();

    const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? '';
    const initial = name ? name.charAt(0).toUpperCase() : 'A';

    return (<DropdownMenu.Root>
        <DropdownMenu.Trigger>
            <button className="h-9 w-9 rounded-full bg-neutral-300 dark:bg-gray-900 border light:text-black dark:text-white flex items-center justify-center text-sm font-medium hover:bg-neutral-400 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                aria-label="User menu">
                {initial}
            </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="end" className="light:bg-white rounded-md shadow-md text-sm">
            <DropdownMenu.Item className="light:hover:bg-neutral-100 rounded" onClick={signOut}>
                Logout
            </DropdownMenu.Item>
        </DropdownMenu.Content>
    </DropdownMenu.Root>);
}
