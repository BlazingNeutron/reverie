import { applyUpdate, Doc } from 'yjs';
import { Buffer } from 'buffer';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type LoaderFunctionArgs, redirect } from 'react-router';
import { createClient } from './lib/supabase/server';

export class SupabaseProvider {
  doc;
  docId;
  supabase;
  awareness : any;
  user : any;
  session : any;

  constructor(docId : string, doc : Doc, supabase : SupabaseClient) {
    this.docId = docId;
    this.doc = doc;
    this.supabase = supabase;

    this.init();
  }

  async init() {
    await this.subscribeToUpdates();

    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      // console.log("Not logged in!")
      return redirect('/login')
    }
    this.user = session.user;
    this.session = session;

    // Send local updates to Supabase
    this.doc.on('update', async (update : any) => {
      await this.sendUpdate(update);
    });

    // Optionally load initial state from DB
    await this.loadInitialUpdates();
  }

  async sendUpdate(update : string) {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      // console.log("Not logged in!")
      return redirect('/login')
    }

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
    await this.supabase.from('doc_index').upsert({
      doc_id: this.docId,
      title: 'Example Note',
      content: this.doc.getText('quill').toString(),
      user_id: this.user.id
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
      // console.log("Not logged in!")
      return redirect('/login')
    }

    this.supabase
      .channel(`yjs-${this.docId}`)
      .on('broadcast', { event: 'y-update' }, (payload : {payload:{update:string}}) => {
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
      // console.log("Not logged in!")
      return redirect('/login')
    }

    const { data, error } = await this.supabase
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
}
