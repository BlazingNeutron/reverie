import { applyUpdate, Doc } from 'yjs';
import { Buffer } from 'buffer';
import { ensureSession } from './auth';
import { subscribe, broadcast } from './realtime';
import { selectDocument, updateDocumentSearch } from './documents';
import { insertYJsUpdates, selectYJsUpdates } from './collaboration';

export class SupabaseProvider {
  doc: Doc | any;
  docId: string | any;
  awareness: any;
  user: any;
  session: any;

  constructor(docId: string, doc: Doc) {
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
    const document = await selectDocument(this.docId);

    // Send local updates to Supabase
    if (this.doc && this.doc.on) {
      this.doc.on('update', async (update: any) => {
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

    await insertYJsUpdates(this.docId, base64Update, this.user.id);
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

    const { data } = await selectYJsUpdates(this.docId, this.user.id)

    if (data) {
      data.forEach((row: any) => {
        const update = Buffer.from(row.update, 'base64');
        applyUpdate(this.doc, update);
      });
    }
  }
}
