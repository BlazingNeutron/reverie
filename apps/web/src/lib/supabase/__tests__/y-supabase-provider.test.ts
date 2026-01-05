import { describe, it, expect, vi } from 'vitest';
import { Doc } from 'yjs';
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
    const doc = new Doc();
    doc.getText('quill').insert(0, 'abc');
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();

    expect(provider.user).toBeTruthy();
    expect(provider.user.id).toBe('test-user');
    expect(mockSupabase.calls.channels).toContain('yjs-doc-1');
  });

  it('sendUpdate encodes update and writes to supabase and broadcasts', async () => {
    const doc = new Doc();
    doc.getText('quill').insert(0, 'abc');
    const mockSupabase = createMockSupabase();
    const provider = new SupabaseProvider('doc-1', doc, mockSupabase as any);

    await provider.init();

    const sample = new Uint8Array([1, 2, 3]);
    await provider.sendUpdate(sample as any);

    expect(mockSupabase.calls.inserts.length).toBeGreaterThan(0);
    expect(mockSupabase.calls.sends.length).toBeGreaterThan(0);
  });
});
