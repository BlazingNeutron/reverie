import { applyUpdate, Doc } from 'yjs';
import { Buffer } from 'buffer';
import { type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseProvider {
  doc : Doc | any;
  docId : string | any;
  supabase;
  awareness : any;
  user : any;
  session : any;

  constructor(supabase : SupabaseClient) {
    this.supabase = supabase;
    this.init();
  }

  async ensureSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) return null;

    this.user = session.user;
    this.session = session;
    return session;
  }

  async init() {
    await this.ensureSession();
  }

  async setDoc(docId : string, doc : Doc) : Promise<any> {
    if (!await this.ensureSession()) return;

    //TODO unsubscribe from previous docId
    if (!docId) {
      return;
    }
    
    this.docId = docId;
    this.doc = doc;
    const document = await this.supabase.from('documents')
      .select('doc_id, title, content, user_id')
      .eq('doc_id', docId);

    // Send local updates to Supabase
    if (this.doc && this.doc.on){
      this.doc.on('update', async (update : any) => {
        await this.sendUpdate(update);
      });

      // Optionally load initial state from DB
      await this.loadInitialUpdates();
      await this.subscribeToUpdates();
    }
    return document;
  }

  async sendUpdate(update : string) {
    if (!await this.ensureSession()) return;

    const base64Update = Buffer.from(update).toString('base64');

    await this.supabase
      .from('yjs_updates')
      .insert([{ doc_id: this.docId, update: base64Update, user_id: this.user.id }]);

    // // Optionally broadcast to other clients via Realtime
    await this.supabase.channel(`yjs-${this.docId}`).send({
      type: 'broadcast',
      event: 'y-update',
      payload: { update: base64Update },
    });
    
    // write document contents to search table
    await this.supabase.from('documents').upsert({
      doc_id: this.docId,
      title: this.doc.title,
      content: this.doc.getText('quill').toString(),
      user_id: this.user.id
    });

    // // Supabase text search
    // const searchResults = await this.supabase
    //   .from('documents')
    //   .select('*')
    //   .textSearch('tsv', `'Test Search'`, { type: 'plain' });
    
  }

  async subscribeToUpdates() {
    if (!await this.ensureSession()) return;

    this.supabase
      .channel(`yjs-${this.docId}`)
      .on('broadcast', { event: 'y-update' }, (payload : {payload:{update:string}}) => {
        const update = Buffer.from(payload.payload.update, 'base64');
        applyUpdate(this.doc, update);
      })
      .subscribe();
  }

  async loadInitialUpdates() {
    if (!await this.ensureSession()) return;

    const { data } = await this.supabase
      .from('yjs_updates')
      .select('update')
      .eq('doc_id', this.docId)
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: true });

    if (data) {
      data.forEach((row : any) => {
        const update = Buffer.from(row.update, 'base64');
        applyUpdate(this.doc, update);
      });
    }
  }

  async findUserDocs() : Promise<any> {
    if (!await this.ensureSession()) return [];
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', this.user.id)
      .order('title', { ascending: false });

    if (error) {
      console.error("Error fetching user docs:", error);
      return [];
    }
    
    return data || [];
  }

  async createDocument(title : string) : Promise<any> {
    if (!await this.ensureSession()) return null;

    const { data } = await this.supabase
      .from('documents')
      .insert({
        "title": title,
        "user_id": this.user.id
      }).select();

    if (data && data.length > 0 && data[0]) {
      console.log(data[0].doc_id);
      return data[0].doc_id;
    }
    return null;
  }
}
