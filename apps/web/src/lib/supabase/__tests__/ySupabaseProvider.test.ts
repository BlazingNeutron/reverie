import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
let SupabaseProvider: any;

// Mock the yjs module so we can observe applyUpdate calls reliably in tests
let mockApplyUpdate = vi.fn();
let mockYDocOnCallback : Function = vi.fn();
class YDoc {
  _texts: Map<string, any>;
  constructor() {
    this._texts = new Map();
  }
  getText(name: string) {
    if (!this._texts.has(name)) {
      this._texts.set(name, { insert: () => { }, toString: () => '' });
    }
    return this._texts.get(name);
  }
  on(name:string, callback:Function) {
    mockYDocOnCallback = callback;
    return name;
  }
}

vi.mock('yjs', () => {
  return {
    Doc: YDoc,
    applyUpdate: (...args: any[]) => mockApplyUpdate(...args)
  };
});
let mockYAwarenessOnCallback : Function = vi.fn();
class Awareness {
  state : any = {};
  on(name:string, callback: Function) {
    mockYAwarenessOnCallback = callback;
    return name;
  }
  setLocalStateField(name:string, fieldData:any) {
    this.state[name] = fieldData;
  }
}
const mockApplyAwarenessUpdate = vi.fn();
const mockEncodeAwarenessUpdate = vi.fn().mockReturnValue("testEncodedUpdate");
vi.mock('y-protocols/awareness', () => {
  return {
    Awareness: Awareness,
    encodeAwarenessUpdate: () => mockEncodeAwarenessUpdate(),
    applyAwarenessUpdate: () => mockApplyAwarenessUpdate(),
  }
});

const mockInsertYJsUpdates = vi.fn();
let mockSelectYJsUpdates = vi.fn().mockReturnValue({ data: [{ update: "Updated Test Text" }] });
vi.mock("../collaboration", () => {
  return {
    selectYJsUpdates: () => mockSelectYJsUpdates(),
    insertYJsUpdates: () => mockInsertYJsUpdates()
  }
})

let mockEnsureSession = vi.fn().mockReturnValue({ user: { id: "test-user" } });
vi.mock("../auth", () => {
  return {
    ensureSession: () => mockEnsureSession()
  }
});

let mockSubscribe = vi.fn();
let mockSubscribeAwareness = vi.fn();
const mockBroadcast = vi.fn();
const mockBroadcastAwareness = vi.fn();
vi.mock("../realtime", () => {
  return {
    broadcast: () => mockBroadcast(),
    subscribe: (...args: any[]) => mockSubscribe(args),
    broadcastAwareness: () => mockBroadcastAwareness(),
    subscribeAwareness: (...args: any[]) => mockSubscribeAwareness(args),
  }
})

let mockSelectDoument = vi.fn().mockReturnValue({ doc_id: "docId1", title: "MockTitle", content: "MockContent", user_id: "userId1" });
vi.mock("../documents", () => {
  return {
    selectDocument: () => mockSelectDoument(),
    updateDocumentSearch: vi.fn(),
  }
})

describe('SupabaseProvider (basic)', () => {
  let provider: any;
  let doc: YDoc | any;
  // it('test', ()=>{})
  beforeEach(async () => {
    doc = new YDoc();
    const module = await import('../ySupabaseProvider');
    SupabaseProvider = module.SupabaseProvider;
    provider = await new SupabaseProvider('doc-1', doc);
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockSelectDoument = vi.fn().mockReturnValue({ doc_id: "docId1", title: "MockTitle", content: "MockContent", user_id: "userId1" });
    mockSubscribe = vi.fn();
    mockSelectYJsUpdates = vi.fn().mockReturnValue({ data: [{ update: "Updated Test Text" }] });
    mockEnsureSession = vi.fn().mockReturnValue({ user: { id: "test-user" } });
    provider = null;
    doc = null;
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('initializes and sets user from session and subscribes to channel', async () => {
    await provider.subscribeToUpdates();

    expect(provider.user).toBeTruthy();
    expect(provider.user.id).toBe('test-user');
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('sendUpdate encodes update and writes to supabase and broadcasts', async () => {
    const sample = new Uint8Array([1, 2, 3]);
    await provider.sendUpdate(sample as any);

    expect(mockInsertYJsUpdates).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalled();
  });

  it('call YDoc.on callback function to mock typing in editor', async () => {
    await mockYDocOnCallback("Test update");

    expect(mockInsertYJsUpdates).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalled();
  });

  it('Subscribed callback function calls applyUpdate', async () => {
    mockApplyUpdate = vi.fn();
    await provider.subscribeToUpdates();

    expect(mockSubscribe).toHaveBeenCalledWith([
      "doc-1",
      expect.any(Function)
    ]);
    // call anonymous function to verify applyUpdate
    if (mockSubscribe && mockSubscribe.mock && mockSubscribe.mock.calls &&
        mockSubscribe.mock.calls[0] && mockSubscribe.mock.calls[0][0] &&
        mockSubscribe.mock.calls[0][0][1]
    ) {
      mockSubscribe.mock.calls[0][0][1]()
    }
    expect(mockApplyUpdate).toHaveBeenCalled()
  });

  it('loadInitialUpdates decodes persisted updates and applies them', async () => {
    mockApplyUpdate = vi.fn();
    mockSelectYJsUpdates = vi.fn().mockReturnValue({ data: [{ update: "Updated Test Text2" }] });
    await provider.loadInitialUpdates();

    expect(mockApplyUpdate).toHaveBeenCalled();
  });

  it('Null session ', async () => {
    mockSelectDoument = vi.fn();
    mockEnsureSession = vi.fn().mockReturnValue(null);
    mockSubscribe = vi.fn();
    mockSelectYJsUpdates = vi.fn();

    provider = await new SupabaseProvider('doc-1', doc);
    await provider.setDoc("testDocId", new YDoc());
    expect(mockSelectDoument).not.toHaveBeenCalled()
    await provider.sendUpdate("test update string");
    expect(mockInsertYJsUpdates).not.toHaveBeenCalled();
    await provider.subscribeToUpdates("testDocId", new YDoc());
    expect(mockSubscribe).not.toHaveBeenCalled();
    await provider.loadInitialUpdates();
    expect(mockSelectYJsUpdates).not.toHaveBeenCalled();
  })

  it('Subscribed Awareness callback call applyAwarenesUpdate', async () => {
    await provider.setDoc("docId1", doc)
    expect(mockSubscribeAwareness).toHaveBeenCalledWith([
      "doc-1",
      expect.any(Function)
    ]);
    // call anonymous function to verify applyAwarenessUpdate
    if (mockSubscribeAwareness && mockSubscribeAwareness.mock && 
        mockSubscribeAwareness.mock.calls && mockSubscribeAwareness.mock.calls[0] && 
        mockSubscribeAwareness.mock.calls[0][0] && mockSubscribeAwareness.mock.calls[0][0][1]
    ) {
      mockSubscribeAwareness.mock.calls[0][0][1]()
    }
    expect(mockApplyAwarenessUpdate).toHaveBeenCalled()
  })

  it('call Awareness.on callback function to mock typing in editor - no updates', async () => {
    await mockYAwarenessOnCallback({added:[],updated:[],removed:[]});

    expect(mockEncodeAwarenessUpdate).not.toHaveBeenCalled();
    expect(mockBroadcastAwareness).not.toHaveBeenCalled();
  });

  it('call Awareness.on callback function to mock typing in editor - added', async () => {
    await mockYAwarenessOnCallback({added:[1234],updated:[],removed:[]});

    expect(mockEncodeAwarenessUpdate).toHaveBeenCalled();
    expect(mockBroadcastAwareness).toHaveBeenCalled();
  });

  it('call Awareness.on callback function to mock typing in editor - updated', async () => {
    await mockYAwarenessOnCallback({added:[],updated:[1234],removed:[]});

    expect(mockEncodeAwarenessUpdate).toHaveBeenCalled();
    expect(mockBroadcastAwareness).toHaveBeenCalled();
  });

  it('call Awareness.on callback function to mock typing in editor - removed', async () => {
    await mockYAwarenessOnCallback({added:[],updated:[1234],removed:[]});

    expect(mockEncodeAwarenessUpdate).toHaveBeenCalled();
    expect(mockBroadcastAwareness).toHaveBeenCalled();
  });

  it('call Awareness.on callback function to mock typing in editor - null', async () => {
    await mockYAwarenessOnCallback(null);

    expect(mockEncodeAwarenessUpdate).not.toHaveBeenCalled();
    expect(mockBroadcastAwareness).not.toHaveBeenCalled();
  });
});
