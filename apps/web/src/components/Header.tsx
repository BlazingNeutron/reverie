import { ShareDialog } from "./ShareDialog";
import { UserMenu } from "./UserMenu";

export function Header() {

    return (<header className="h-14 border-b light:bg-white flex gap-2 justify-end lg:justify-between px-4">
        <div className="flex gap-3 max-sm:hidden md:visible">
            <div className="font-semibold text-lg p-3">
                Reverie Notes
            </div>
        </div>
        <div className="flex items-center gap-3">
            <ShareDialog />
            <UserMenu />
        </div>
    </header>);
}
