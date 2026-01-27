import { supabase } from "./client";
import { Buffer } from 'buffer';

export async function broadcast(docId: string, base64Update: string) {
    await supabase.channel(`yjs-${docId}`).send({
        type: 'broadcast',
        event: 'y-update',
        payload: { update: base64Update },
    });
}

export async function subscribe(docId: string, callback: Function) {
    supabase.channel(`yjs-${docId}`)
        .on('broadcast', { event: 'y-update' }, (payload: { payload: { update: string } }) => {
            const update = Buffer.from(payload.payload.update, 'base64');
            callback(update)
        })
        .subscribe();
}