import { describe, it, expect, vi } from 'vitest';

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

import * as yjs from 'yjs';
import { SupabaseProvider } from '../y-supabase-provider';

function createMockSupabase() {
  const calls: any = { channels: [], inserts: [], upserts: [], sends: [] };

  const channelObj = {
    on: vi.fn().mockReturnThis(),
    send: vi.fn().mockImplementation(async (payload: any) => {
      calls.sends.push(payload);
      return { ok: true };
    }),
    subscribe: vi.fn().mockReturnThis(),
  };

  const fromObj = {
    insert: vi.fn().mockImplementation(async (rows: any) => {
      calls.inserts.push(rows);
      return { data: rows };
    }),
    upsert: vi.fn().mockImplementation(async (row: any) => {
      calls.upserts.push(row);
      return { data: row };
    }),
    // Provide a chainable API for select(...).eq(...).eq(...).order(...)
    select: vi.fn().mockImplementation(() => {
      const chain: any = {
        eq() {
          return chain;
        },
        order: async () => ({ data: [] }),
        textSearch: async () => ({ data: [] }),
      };
      return chain;
    }),
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
    from: () => fromObj,
  };
}

describe('SupabaseProvider (basic)', () => {
  it('initializes and sets user from session and subscribes to channel', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();

    expect(provider.user).toBeTruthy();
    expect(provider.user.id).toBe('test-user');
    expect(mockSupabase.calls.channels).toContain('yjs-doc-1');
  });

  it('sendUpdate encodes update and writes to supabase and broadcasts', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();

    const sample = new Uint8Array([1, 2, 3]);
    await provider.sendUpdate(sample as any);

    expect(mockSupabase.calls.inserts.length).toBeGreaterThan(0);
    expect(mockSupabase.calls.sends.length).toBeGreaterThan(0);
  });

  it('subscribeToUpdates applies incoming broadcast updates', async () => {
    const doc = new yjs.Doc();
    doc.getText('quill').insert(0, 'abc');
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();
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
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();
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
    const doc = new yjs.Doc();
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();

    const data = await provider.findUserDocs();

    expect(data).toBeDefined();
  });
});
