import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";
import { Buffer } from "buffer";
import { ensureSession } from "./auth";
import {
  subscribe,
  broadcast,
  subscribeAwareness,
  broadcastAwareness,
} from "./realtime";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";
import { selectDocument, updateDocumentSearch } from "./documents";
import {
  insertYJsUpdates,
  selectYJsUpdates,
  upsertYJsSnapshot,
  selectYJsSnapshot,
  selectYJsUpdatesSince,
  deleteYJsUpdatesBefore,
} from "./collaboration";

export class SupabaseProvider {
  doc: Doc | any;
  docId: string | any;
  awareness: any;
  user: any;
  session: any;
  snapshotTimer: any;
  snapshotDelay: number = 5000; // ms

  constructor(docId: string, doc: Doc) {
    // create awareness immediately so callers can pass it to bindings
    try {
      this.docId = docId;
      this.doc = doc;
      this.awareness = new Awareness(doc);
    } catch (err) {
      // ignore if doc is not ready
    }
  }

  async init() {
    const session = await ensureSession();
    this.session = session;
    this.user = session?.user;

    this.setDoc();
  }

  async setDoc() {
    if (!this.session) return;

    this.initializeUserAwareness();
    const document = await selectDocument(this.docId);

    // Send local updates to Supabase
    if (this.doc && this.doc.on) {
      // Optionally load initial state from DB
      await this.loadInitialUpdates();
      await this.subscribeToUpdates();

      this.doc.on("update", async (update: any) => {
        // send deltas to broadcaster and persist
        await this.sendUpdate(update);
        // schedule periodic snapshot/compaction
        this.scheduleSnapshot();
      });
    }
    return document;
  }

  async sendUpdate(update: string) {
    if (!this.session) return;
    const base64Update = Buffer.from(update).toString("base64");
    await broadcast(this.docId, base64Update);

    const hasUpdates = await updateDocumentSearch(
      this.docId,
      this.doc.title,
      this.doc.getText("quill").toString(),
      this.user.id,
    );
    if (hasUpdates) {
      await insertYJsUpdates(this.docId, base64Update);
    }
  }

  async subscribeToUpdates() {
    if (!this.session) return;

    await subscribe(this.docId, (update: Uint8Array) => {
      applyUpdate(this.doc, update);
    });
  }

  async loadInitialUpdates() {
    if (!this.session) return;

    // First try to load a persisted snapshot
    const snapRes = await selectYJsSnapshot(this.docId);
    let since: string | undefined = undefined;
    if (
      snapRes &&
      snapRes.data &&
      snapRes.data.length > 0 &&
      snapRes.data[0].snapshot
    ) {
      try {
        const snapBuf = Buffer.from(snapRes.data[0].snapshot, "base64");
        applyUpdate(this.doc, snapBuf);
        // use snapshot creation time to fetch only newer deltas

        since = snapRes.data[0].created_at;
      } catch (e) {
        // ignore snapshot apply errors
      }
    }

    // then apply deltas after snapshot (or all deltas if no snapshot)
    let updatesRes;
    if (since) {
      updatesRes = await selectYJsUpdatesSince(this.docId, since);
    } else {
      updatesRes = await selectYJsUpdates(this.docId);
    }

    if (updatesRes && updatesRes.data) {
      updatesRes.data.forEach((row: any) => {
        const update = Buffer.from(row.update, "base64");
        applyUpdate(this.doc, update);
      });
    }
  }

  scheduleSnapshot() {
    try {
      if (this.snapshotTimer) {
        clearTimeout(this.snapshotTimer);
      }

      this.snapshotTimer = setTimeout(() => {
        this.persistSnapshot();
      }, this.snapshotDelay);
    } catch (e) {
      // ignore
    }
  }

  async persistSnapshot() {
    if (!this.session || !this.doc || !this.docId) return;
    try {
      const snap = encodeStateAsUpdate(this.doc);
      const base64 = Buffer.from(snap).toString("base64");
      const row = await upsertYJsSnapshot(this.docId, base64);
      // compact older deltas up to snapshot time, if available
      if (row && row.created_at) {
        await deleteYJsUpdatesBefore(this.docId, row.created_at);
      }
    } catch (e) {
      // ignore snapshot errors
    }
  }

  initializeUserAwareness() {
    if (this.awareness) {
      this.awareness.on("update", (changes: any) => {
        const { added, updated, removed } = changes || {};
        const clients: number[] = [];
        if (Array.isArray(added)) clients.push(...added);
        if (Array.isArray(updated)) clients.push(...updated);
        if (Array.isArray(removed)) clients.push(...removed);
        if (clients.length > 0) {
          try {
            const update = encodeAwarenessUpdate(this.awareness, clients);
            const base64 = Buffer.from(update).toString("base64");
            broadcastAwareness(this.docId, base64);
          } catch (e) {
            // ignore
          }
        }
      });

      // subscribe to remote awareness updates and apply
      subscribeAwareness(this.docId, (update: Uint8Array) => {
        // console.log("Awareness subscribe callback ", update);
        try {
          applyAwarenessUpdate(this.awareness, update, "remote");
        } catch (e) {
          // ignore
        }
      });
      this.awareness.setLocalStateField("user", {
        name: "User",
        color: "blue",
      });
    }
  }
}
