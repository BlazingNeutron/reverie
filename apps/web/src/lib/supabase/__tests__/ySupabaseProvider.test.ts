import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

// Mock the yjs module so we can observe applyUpdate calls reliably in tests
let mockApplyUpdate = vi.fn();
let mockYDocOnCallback: Function = vi.fn();
class YDoc {
  _texts: Map<string, any>;
  constructor() {
    this._texts = new Map();
  }
  getText(name: string) {
    if (!this._texts.has(name)) {
      this._texts.set(name, { insert: () => {}, toString: () => "" });
    }
    return this._texts.get(name);
  }
  on(name: string, callback: Function) {
    mockYDocOnCallback = async (update: string) => {
      console.log("mockYDocOnCallback has been called");
      await callback(update);
    };
    return name;
  }
}

vi.mock("yjs", () => {
  return {
    Doc: YDoc,
    applyUpdate: (...args: any[]) => mockApplyUpdate(...args),
    encodeStateAsUpdate: vi.fn().mockReturnValue("encodedState"),
  };
});
let mockYAwarenessOnCallback: Function = vi.fn();
class Awareness {
  state: any = {};
  on(name: string, callback: Function) {
    mockYAwarenessOnCallback = callback;
    return name;
  }
  setLocalStateField(name: string, fieldData: any) {
    this.state[name] = fieldData;
  }
}
const mockApplyAwarenessUpdate = vi.fn();
const mockEncodeAwarenessUpdate = vi.fn().mockReturnValue("testEncodedUpdate");
vi.mock("y-protocols/awareness", () => {
  return {
    Awareness: Awareness,
    encodeAwarenessUpdate: () => mockEncodeAwarenessUpdate(),
    applyAwarenessUpdate: () => mockApplyAwarenessUpdate(),
  };
});

let mockInsertYJsUpdates = vi.fn();
let mockSelectYJsUpdates = vi
  .fn()
  .mockReturnValue({ data: [{ update: "Updated Test Text" }] });
let mockSelectYJsSnapshots = vi
  .fn()
  .mockReturnValue({
    data: [{ snapshot: "Snapshoted Test Text", created_at: new Date() }],
  });
let mockSelectYJsUpdatesSince = vi
  .fn()
  .mockReturnValue({ data: [{ update: "Updated Test Text" }] });
let mockUpsertYJsSnapshot = vi
  .fn()
  .mockReturnValue({ created_at: "snapshotCreatedAt" });
const mockDeleteYJsUpdatesBefore = vi.fn();
vi.mock("../collaboration", () => {
  return {
    selectYJsUpdates: () => mockSelectYJsUpdates(),
    insertYJsUpdates: () => mockInsertYJsUpdates(),
    selectYJsSnapshot: () => mockSelectYJsSnapshots(),
    selectYJsUpdatesSince: () => mockSelectYJsUpdatesSince(),
    upsertYJsSnapshot: () => mockUpsertYJsSnapshot(),
    deleteYJsUpdatesBefore: () => mockDeleteYJsUpdatesBefore(),
  };
});

let mockEnsureSession = vi.fn().mockReturnValue({ user: { id: "test-user" } });
vi.mock("../auth", () => {
  return {
    ensureSession: () => mockEnsureSession(),
  };
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
  };
});

let mockSelectDoument = vi
  .fn()
  .mockReturnValue({
    doc_id: "docId1",
    title: "MockTitle",
    content: "MockContent",
    user_id: "userId1",
  });
vi.mock("../documents", () => {
  return {
    selectDocument: () => mockSelectDoument(),
    updateDocumentSearch: vi.fn().mockReturnValue(true),
  };
});

describe("SupabaseProvider (basic)", () => {
  let provider: any;
  let doc: YDoc | any;
  let SupabaseProvider: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    doc = new YDoc();
    const module = await import("../ySupabaseProvider");
    SupabaseProvider = module.SupabaseProvider;
    provider = new SupabaseProvider("doc-1", doc);
    await provider.init();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockSelectDoument = vi
      .fn()
      .mockReturnValue({
        doc_id: "docId1",
        title: "MockTitle",
        content: "MockContent",
        user_id: "userId1",
      });
    mockSubscribe = vi.fn();
    mockSelectYJsUpdates = vi
      .fn()
      .mockReturnValue({ data: [{ update: "Updated Test Text" }] });
    mockEnsureSession = vi.fn().mockReturnValue({ user: { id: "test-user" } });
    mockInsertYJsUpdates = vi.fn();
    provider = null;
    doc = null;
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("initializes and sets user from session and subscribes to channel", async () => {
    await provider.subscribeToUpdates();

    expect(provider.user).toBeTruthy();
    expect(provider.user.id).toBe("test-user");
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it("sendUpdate encodes update and writes to supabase and broadcasts", async () => {
    const sample = new Uint8Array([1, 2, 3]);
    await provider.sendUpdate(sample as any);

    expect(mockInsertYJsUpdates).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalled();
  });

  it("call YDoc.on callback function to mock typing in editor", async () => {
    await provider.setDoc();
    await mockYDocOnCallback("Test update");

    expect(mockInsertYJsUpdates).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalled();
  });

  it("Subscribed callback function calls applyUpdate", async () => {
    mockApplyUpdate = vi.fn();
    await provider.subscribeToUpdates();

    expect(mockSubscribe).toHaveBeenCalledWith(["doc-1", expect.any(Function)]);
    // call anonymous function to verify applyUpdate
    if (
      mockSubscribe &&
      mockSubscribe.mock &&
      mockSubscribe.mock.calls &&
      mockSubscribe.mock.calls[0] &&
      mockSubscribe.mock.calls[0][0] &&
      mockSubscribe.mock.calls[0][0][1]
    ) {
      mockSubscribe.mock.calls[0][0][1]();
    }
    expect(mockApplyUpdate).toHaveBeenCalled();
  });

  it("loadInitialUpdates decodes persisted snapshot, then updates and applies them", async () => {
    mockApplyUpdate = vi.fn();
    await provider.loadInitialUpdates();

    expect(mockApplyUpdate).toHaveBeenCalledTimes(2);
  });

  it("Null session ", async () => {
    mockSelectDoument = vi.fn();
    mockEnsureSession = vi.fn().mockReturnValue(null);
    mockSubscribe = vi.fn();
    mockSelectYJsUpdates = vi.fn();

    provider = await new SupabaseProvider("doc-1", doc);
    await provider.setDoc();
    expect(mockSelectDoument).not.toHaveBeenCalled();
    await provider.sendUpdate("test update string");
    expect(mockInsertYJsUpdates).not.toHaveBeenCalled();
    await provider.subscribeToUpdates("testDocId", new YDoc());
    expect(mockSubscribe).not.toHaveBeenCalled();
    await provider.loadInitialUpdates();
    expect(mockSelectYJsUpdates).not.toHaveBeenCalled();
  });

  it("Subscribed Awareness callback call applyAwarenesUpdate", async () => {
    await provider.setDoc();
    expect(mockSubscribeAwareness).toHaveBeenCalledWith([
      "doc-1",
      expect.any(Function),
    ]);
    // call anonymous function to verify applyAwarenessUpdate
    if (
      mockSubscribeAwareness &&
      mockSubscribeAwareness.mock &&
      mockSubscribeAwareness.mock.calls &&
      mockSubscribeAwareness.mock.calls[0] &&
      mockSubscribeAwareness.mock.calls[0][0] &&
      mockSubscribeAwareness.mock.calls[0][0][1]
    ) {
      mockSubscribeAwareness.mock.calls[0][0][1]();
    }
    expect(mockApplyAwarenessUpdate).toHaveBeenCalled();
  });

  it("call Awareness.on callback function to mock typing in editor - no updates", async () => {
    await mockYAwarenessOnCallback({ added: [], updated: [], removed: [] });

    expect(mockEncodeAwarenessUpdate).not.toHaveBeenCalled();
    expect(mockBroadcastAwareness).not.toHaveBeenCalled();
  });

  it("call Awareness.on callback function to mock typing in editor - added", async () => {
    await mockYAwarenessOnCallback({ added: [1234], updated: [], removed: [] });

    expect(mockEncodeAwarenessUpdate).toHaveBeenCalled();
    expect(mockBroadcastAwareness).toHaveBeenCalled();
  });

  it("call Awareness.on callback function to mock typing in editor - updated", async () => {
    await mockYAwarenessOnCallback({ added: [], updated: [1234], removed: [] });

    expect(mockEncodeAwarenessUpdate).toHaveBeenCalled();
    expect(mockBroadcastAwareness).toHaveBeenCalled();
  });

  it("call Awareness.on callback function to mock typing in editor - removed", async () => {
    await mockYAwarenessOnCallback({ added: [], updated: [1234], removed: [] });

    expect(mockEncodeAwarenessUpdate).toHaveBeenCalled();
    expect(mockBroadcastAwareness).toHaveBeenCalled();
  });

  it("call Awareness.on callback function to mock typing in editor - null", async () => {
    await mockYAwarenessOnCallback(null);

    expect(mockEncodeAwarenessUpdate).not.toHaveBeenCalled();
    expect(mockBroadcastAwareness).not.toHaveBeenCalled();
  });

  it("loadInitialUpdates no snapshots, loads updates and applies them", async () => {
    mockSelectYJsSnapshots = vi.fn().mockReturnValue();
    mockApplyUpdate = vi.fn();
    await provider.loadInitialUpdates();

    expect(mockSelectYJsUpdates).toHaveBeenCalled();
    expect(mockApplyUpdate).toHaveBeenCalled();
  });

  it("scheduleSnapshot is called", async () => {
    await provider.setDoc();
    await mockYDocOnCallback("Test update");

    expect(provider.snapshotTimer).not.toBeNull();

    expect(mockUpsertYJsSnapshot).not.toHaveBeenCalled();
    expect(mockDeleteYJsUpdatesBefore).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(provider.snapshotDelay);
    expect(mockUpsertYJsSnapshot).toHaveBeenCalled();
    expect(mockDeleteYJsUpdatesBefore).toHaveBeenCalled();
  });
});
