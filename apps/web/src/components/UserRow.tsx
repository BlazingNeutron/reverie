import { useEffect, useState } from "react";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { shareDocument, unshareDocument } from "../lib/supabase/sharing";

export type Profile = {
    user_id: string,
    display_name: string,
    is_shared: boolean
};

export function UserRow({ currentDocId, profile } : { currentDocId : string, profile: Profile }) {
    const [shared, setShared] = useState<boolean>(profile.is_shared);

    useEffect(() => {
        profile.is_shared = shared;
    }, [shared]);

    const handleShare = () => {
        shareDocument(currentDocId, profile.user_id);
        setShared(true);
    }

    const handleUnshare = () => {
        unshareDocument(currentDocId, profile.user_id);
        setShared(false);
    }

    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center text-sm font-medium">
                    {profile.display_name.charAt(0)}
                </div>
                <span className="text-sm">{profile.display_name}</span>
            </div>

            {shared && <Button onClick={handleUnshare}>
                Remove <Cross2Icon />
            </Button>
            }
            {!shared && <Button onClick={handleShare}>
                Add <CheckIcon />
            </Button>}
        </div>
    );
}