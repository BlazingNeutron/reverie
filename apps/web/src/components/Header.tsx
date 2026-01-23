import { ShareDialog } from "./ShareDialog";
import { UserMenu } from "./UserMenu";

export function Header() {

    return (<header className="h-14 border-b light:bg-white flex gap-2 justify-end px-4">
        <div className="flex items-center gap-3">
            <ShareDialog />
            <UserMenu />
        </div>
    </header>);
}
