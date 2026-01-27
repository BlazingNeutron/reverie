import { vi } from "vitest";

function supabaseMock() {
  class SupabaseQueryBuilder {
    table: string;
    query: any;
    results: any[];

    constructor(table: string) {
      this.table = table;
      this.query = {};
      this.results = [];
    }

    select(columns: string) {
      this.query.select = columns;
      return this;
    }

    eq(column: string, value: any) {
      if (!this.query.filters) this.query.filters = [];
      this.query.filters.push({ column, value });
      return this;
    }

    neq(column: string, value: any) {
      if (!this.query.filters) this.query.filters = [];
      this.query.filters.push({ column, value });
      return this;
    }

    in(column: string, value: any[]) {
      if (!this.query.filters) this.query.filters = [];
      this.query.filters.push({ column, value });
      return this;
    }


    order(column: string, { ascending = true }) {
      this.query.order = { column, ascending };
      return this;
    }

    textSearch(column: string, searchTerm: string) {
      this.query.textSearch = { column, searchTerm };
      return this;
    }

    limit(value: Int16Array) {
      this.query.limit = value;
      return this;
    }

    insert(rows: any) {
      rows['doc_id'] = 'new_doc_id';
      this.query.inserts = rows;
      return this;
    }

    upsert(row: any) {
      this.query.upserts = row;
      return this;
    }

    delete() {
      this.query.deletes = this.table;
      return this;
    }

    then(resolve: any, reject: any) {
      if (this.results.length > 0) {
        if (this.results[0] instanceof Error) {
          setTimeout(() => reject(this.results.pop()), 100);  
        }
        setTimeout(() => resolve(this.results.pop()), 100);
      } else {
        const result = {
          data: this.query,
          error: null,
        };

        setTimeout(() => resolve(result), 100);
      }
    }

    getQuery() {
      return this.query;
    }

    setResults(results:any[]) {
      this.results = results.reverse();
    }
  }

  const calls: any = { channels: [], sends: [], on: [], query: null };
  const channelObj = {
    on: (name: string, event : any, callback: Function) => { 
      calls.on.push([ name, event, callback]);
      return { subscribe: () => ({}) };
    },
    send: vi.fn().mockImplementation(async (payload: any) => {
      calls.sends.push(payload);
      if (calls.on.length > 0) {
        calls.on[0][2](payload)
      }
      return { ok: true };
    }),
    subscribe: vi.fn().mockReturnThis(),
  };

  const mockSupbase = {
    calls,
    results : [{}],
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'test-user' } } } }),
      signInWithPassword: vi.fn().mockReturnValue({ error: null }),
      signOut: vi.fn(),
      onAuthStateChange: (cb: any) => {
        return { data: { subscription: { unsubscribe: cb } } };
      }
    },
    channel: (name: string) => {
      calls.channels.push(name);
      return channelObj;
    },
    from: (table:string)=>{ table }
  };
  mockSupbase.results = [];
  mockSupbase.from = (table: string) => {
    const fromObj = new SupabaseQueryBuilder(table);
    calls.query = () => fromObj.getQuery()
    fromObj.setResults(mockSupbase.results || []);
    return fromObj;
  }
  return mockSupbase;
}

export const supabaseClientMock = supabaseMock();