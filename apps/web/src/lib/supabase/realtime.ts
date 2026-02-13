import { supabase } from "./client";
import { Buffer } from "buffer";

export async function broadcast(docId: string, base64Update: string) {
  const channel = await supabase.channel(`yjs-${docId}`);
  await channel.send({
    type: "broadcast",
    event: "y-update",
    payload: { update: base64Update },
  });
}

export async function subscribe(docId: string, callback: Function) {
  const channel = supabase
    .channel(`yjs-${docId}`)
    .on(
      "broadcast",
      { event: "y-update" },
      (payload: { payload: { update: string } }) => {
        const update = Buffer.from(payload.payload.update, "base64");
        callback(update);
      },
    )
    .subscribe();
  return channel;
}

export async function broadcastAwareness(
  docId: string,
  base64Awareness: string,
) {
  await supabase.channel(`yjs-${docId}`).send({
    type: "broadcast",
    event: "awareness",
    payload: { awareness: base64Awareness },
  });
}

export async function subscribeAwareness(docId: string, callback: Function) {
  supabase
    .channel(`yjs-${docId}`)
    .on(
      "broadcast",
      { event: "awareness" },
      (payload: { payload: { awareness: string } }) => {
        const update = Buffer.from(payload.payload.awareness, "base64");
        callback(update);
      },
    )
    .subscribe();
}
