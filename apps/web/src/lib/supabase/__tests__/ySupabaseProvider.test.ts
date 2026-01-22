import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import * as yjs from 'yjs';
import { SupabaseProvider } from '../ySupabaseProvider';

// Mock the yjs module so we can observe applyUpdate calls reliably in tests
vi.mock('yjs', () => {
  return {
    Doc: class {
      _texts: Map<string, any>;
      constructor() {
        this._texts = new Map();
      }
      getText(name: string) {
        if (!this._texts.has(name)) {
          this._texts.set(name, { insert: () => {}, toString: () => '' });
        }
        return this._texts.get(name);
      }
      on() {
        return undefined;
      }
    },
    applyUpdate: vi.fn(),
  };
});

function createMockSupabase() {
  const calls: any = { channels: [], inserts: [], upserts: [], sends: [], selects: [] };

  const channelObj = {
    on: vi.fn().mockReturnThis(),
    send: vi.fn().mockImplementation(async (payload: any) => {
      calls.sends.push(payload);
      return { ok: true };
    }),
    subscribe: vi.fn().mockReturnThis(),
  };

  const selectObj = vi.fn().mockImplementation(() => {
    const chain: any = {
      eq() {
        return chain;
      },
      order: async () => ({ data: [] }),
      textSearch: async () => ({ data: [] }),
    };
    calls.selects.push(chain);
    return chain;
  });

  const fromObj = {
    insert: vi.fn().mockImplementation((rows: any) => {
      rows['doc_id'] = 'new_doc_id';
      calls.inserts.push(rows);
      return {
        select: async () => {
          calls.selects.push(rows);
          return { data: [rows] }
        },
      } as any;
    }),
    upsert: vi.fn().mockImplementation(async (row: any) => {
      calls.upserts.push(row);
      return { data: row };
    }),
    select: selectObj,
    textSearch: vi.fn().mockResolvedValue({ data: [] }),
  };

  return {
    calls,
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'test-user' } } } }),
    },
    channel: (name: string) => {
      calls.channels.push(name);
      return channelObj;
    },
    from: (...args: any[]) => fromObj,
  };
}

describe('SupabaseProvider (basic)', () => {
  let mockSupabase : any;
  let provider : any;
  beforeEach(()=>{
    mockSupabase = createMockSupabase();
    provider = new SupabaseProvider(mockSupabase as any);
  });

  afterEach(()=>{
    mockSupabase = null;
    provider = null;
  });  

  it('initializes and sets user from session and subscribes to channel', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');
    await provider.setDoc('doc-1', doc);
    
    expect(provider.user).toBeTruthy();
    expect(provider.user.id).toBe('test-user');
    expect(mockSupabase.calls.channels).toContain('yjs-doc-1');
  });

  it('sendUpdate encodes update and writes to supabase and broadcasts', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');
    
    await provider.setDoc('doc-1', doc);

    const sample = new Uint8Array([1, 2, 3]);
    await provider.sendUpdate(sample as any);

    expect(mockSupabase.calls.inserts.length).toBeGreaterThan(0);
    expect(mockSupabase.calls.sends.length).toBeGreaterThan(0);
  });

  it('subscribeToUpdates applies incoming broadcast updates', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');
    
    // call subscribeToUpdates directly (init also calls it but we call the method to be explicit)
    await provider.subscribeToUpdates();

    // simulate a broadcast payload with a base64 update
    const sample = Buffer.from(new Uint8Array([1, 2, 3])).toString('base64');
    // invoke captured handler
    expect(mockSupabase.calls).toBeTruthy();
    const channel = mockSupabase.channel('yjs-doc-1');
    // find the registered handler (it's usually the last argument passed to .on)
    channel.on.mock.calls.forEach((args: any[]) => {
      const possibleHandler = args.find((a: any) => typeof a === 'function');
      if (possibleHandler) {
        possibleHandler({ payload: { update: sample } });
      }
    });

    expect((yjs as any).applyUpdate).toHaveBeenCalled();
    (yjs as any).applyUpdate.mockClear();
  });

  it('loadInitialUpdates decodes persisted updates and applies them', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');

    // Override the `from` handler for this test to return a pre-seeded update
    const originalFrom = mockSupabase.from;
    const updateBytes = new Uint8Array([5, 6, 7]);
    const base64 = Buffer.from(updateBytes).toString('base64');
    mockSupabase.from = (table: string) => {
      if (table === 'yjs_updates') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: async () => ({ data: [{ update: base64 }] }),
              }),
            }),
          }),
        } as any;
      }
      return originalFrom();
    };

    await provider.loadInitialUpdates();

    expect((yjs as any).applyUpdate).toHaveBeenCalled();
    (yjs as any).applyUpdate.mockClear();
  });

  it('select all documents for user', async () => {
    const data = await provider.findUserDocs();

    expect(data).toBeDefined();
  });

  it('create document ', async () => {
    const doc_id = await provider.createDocument("New Title");
    expect(mockSupabase.calls.inserts.length).toBe(1);
    expect(mockSupabase.calls.selects.length).toBe(1);
    expect(doc_id).toBe("new_doc_id");
  });
});
