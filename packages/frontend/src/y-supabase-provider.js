import { applyUpdate } from 'yjs';

export class SupabaseProvider {
  doc;
  docId;
  supabase;
  awareness;
  user;
  session;

  constructor(docId, doc, supabase) {
    this.docId = docId;
    this.doc = doc;
    this.supabase = supabase;

    this.init();
  }

  async init() {
    await this.subscribeToUpdates();

    // login using supabase
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test',
    })
    const { session, user } = data
    this.user = user;
    this.session = session;

    // Send local updates to Supabase
    this.doc.on('update', async (update) => {
      await this.sendUpdate(update);
    });

    // Optionally load initial state from DB
    await this.loadInitialUpdates();
  }

  async sendUpdate(update) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      console.log("Not logged in!")
      return
    }

    const base64Update = Buffer.from(update).toString('base64');

    await this.supabase
      .from('yjs_updates')
      .insert([{ doc_id: this.docId, update: base64Update, user_permission: this.user.id }]);

    // // Optionally broadcast to other clients via Realtime
    // await this.supabase.channel(`yjs-${this.docId}`).send({
    //   type: 'broadcast',
    //   event: 'y-update',
    //   payload: { update: base64Update },
    // });
    
    // write document contents to search table
    await this.supabase.from('doc_index').upsert({
      doc_id: this.docId,
      title: 'Example Note',
      content: this.doc.getText('quill').toString() // plain text version
    });

    // Supabase text search
    const searchResults = await this.supabase
      .from('doc_index')
      .select('*')
      .textSearch('tsv', `'Test Search'`, { type: 'plain' });
    console.log(searchResults);
  }

  async subscribeToUpdates() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      console.log("Not logged in!")
      return
    }

    this.supabase
      .channel(`yjs-${this.docId}`)
      .on('broadcast', { event: 'y-update' }, (payload) => {
        const update = Buffer.from(payload.payload.update, 'base64');
        applyUpdate(this.doc, update);
      })
      .subscribe();
  }

  async loadInitialUpdates() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      console.log("Not logged in!")
      return
    }

    const { data, error } = await this.supabase
      .from('yjs_updates')
      .select('update')
      .eq('doc_id', this.docId)
      .eq('user_permission', this.user.id)
      .order('created_at', { ascending: true });

    if (data) {
      data.forEach((row) => {
        const update = Buffer.from(row.update, 'base64');
        applyUpdate(this.doc, update);
      });
    }
  }
}
