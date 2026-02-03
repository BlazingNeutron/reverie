import { applyUpdate, Doc } from 'yjs';
import { Buffer } from 'buffer';
import { ensureSession } from './auth';
import { subscribe, broadcast, subscribeAwareness, broadcastAwareness } from './realtime';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import { selectDocument, updateDocumentSearch } from './documents';
import { insertYJsUpdates, selectYJsUpdates } from './collaboration';

export class SupabaseProvider {
  doc: Doc | any;
  docId: string | any;
  awareness: any;
  user: any;
  session: any;

  constructor(docId: string, doc: Doc) {
    // create awareness immediately so callers can pass it to bindings
    try {
      this.doc = doc;
      this.awareness = new Awareness(doc);
    } catch (err) {
      // ignore if doc is not ready
    }

    this.init().then(()=>{
      this.setDoc(docId, doc);
    });
  }

  async init() {
    const session = await ensureSession();
    this.session = session;
    this.user = session?.user;
  }

  async setDoc(docId: string, doc: Doc): Promise<any> {
    if (!this.session) return;

    //TODO unsubscribe from previous docId
    if (!docId) {
      return;
    }

    this.docId = docId;
    this.doc = doc;
    this.initializeUserAwareness();
    const document = await selectDocument(this.docId);

    // Send local updates to Supabase
    if (this.doc && this.doc.on) {
      this.doc.on('update', async (update: any) => {
        // TODO debounce
        await this.sendUpdate(update);
      });

      // Optionally load initial state from DB
      await this.loadInitialUpdates();
      await this.subscribeToUpdates();
    }
    return document;
  }

  async sendUpdate(update: string) {
    if (!this.session) return;

    const base64Update = Buffer.from(update).toString('base64');

    await insertYJsUpdates(this.docId, base64Update);
    await broadcast(this.docId, base64Update);

    await updateDocumentSearch(this.docId, this.doc.title, this.doc.getText('quill').toString(), this.user.id);
  }

  async subscribeToUpdates() {
    if (!this.session) return;

    await subscribe(this.docId, (update: Uint8Array) => {
      applyUpdate(this.doc, update);
    });
  }

  async loadInitialUpdates() {
    if (!this.session) return;

    const { data } = await selectYJsUpdates(this.docId)

    if (data) {
      data.forEach((row: any) => {
        const update = Buffer.from(row.update, 'base64');
        applyUpdate(this.doc, update);
      });
    }
  }

  initializeUserAwareness() {
    if (this.awareness) {
      this.awareness.on('update', (changes: any) => {
        const { added, updated, removed } = changes || {};
        const clients: number[] = [];
        if (Array.isArray(added)) clients.push(...added);
        if (Array.isArray(updated)) clients.push(...updated);
        if (Array.isArray(removed)) clients.push(...removed);
        if (clients.length > 0) {
          try {
            const update = encodeAwarenessUpdate(this.awareness, clients);
            const base64 = Buffer.from(update).toString('base64');
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
          applyAwarenessUpdate(this.awareness, update, 'remote');
        } catch (e) {
          // ignore
        }
      });
      this.awareness.setLocalStateField('user', {
        name: "User",
        color: 'blue'
      });
    }
  }
}
