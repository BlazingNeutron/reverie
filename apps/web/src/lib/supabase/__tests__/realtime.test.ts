import {
  broadcast,
  broadcastAwareness,
  subscribe,
  subscribeAwareness,
} from "../realtime";
import { supabaseClientMock } from "../../../__mocks__/supabaseClientMock";
import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";

describe("supabase realtime", () => {
  beforeEach(() => {
    //vi.restoreAllMocks();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.resetAllMocks();
    supabaseClientMock.calls.channels.length = 0;
    supabaseClientMock.calls.on.length = 0;
    supabaseClientMock.calls.sends.length = 0;
  });

  // it('Realtime document updates broadcast', async () => {
  //     await broadcast("docId1", "base64Update");

  //     expect(supabaseClientMock.calls.channels).toEqual(['yjs-docId1']);
  //     expect(supabaseClientMock.calls.sends).toEqual([{
  //         "event": "y-update",
  //         "payload": {
  //             "update": "base64Update",
  //         },
  //         "type": "broadcast",
  //     }]);
  // });

  it("Realtime document updates subscribe", async () => {
    const callback = vi.fn();
    await subscribe("docId1", callback);

    expect(supabaseClientMock.calls.channels).toEqual(["yjs-docId1"]);
    expect(supabaseClientMock.calls.on[0][0]).toBe("broadcast");
    expect(supabaseClientMock.calls.on[0][1]).toEqual({ event: "y-update" });
  });

  it("Realtime document updates subscribe - callback", async () => {
    const callback = vi.fn();

    await subscribe("docId1", callback);
    expect(supabaseClientMock.calls.on.length).toBe(1);
    await broadcast("docId1", "base64Update");

    expect(callback).toHaveBeenCalled();
  });

  it("Realtime other user awareness broadcast", async () => {
    await broadcastAwareness("docId1", "base64Update");

    expect(supabaseClientMock.calls.channels).toEqual(["yjs-docId1"]);
    expect(supabaseClientMock.calls.sends).toEqual([
      {
        event: "awareness",
        payload: {
          awareness: "base64Update",
        },
        type: "broadcast",
      },
    ]);
  });

  it("Realtime other user awareness subscribe", async () => {
    const callback = vi.fn();
    await subscribeAwareness("docId1", callback);

    expect(supabaseClientMock.calls.channels).toEqual(["yjs-docId1"]);
    expect(supabaseClientMock.calls.on[0][0]).toBe("broadcast");
    expect(supabaseClientMock.calls.on[0][1]).toEqual({ event: "awareness" });
  });

  it("Realtime other user awareness subscribe - callback", async () => {
    const callback = vi.fn();
    await subscribeAwareness("docId1", callback);
    await broadcastAwareness("docId1", "base64Update");

    expect(callback).toHaveBeenCalled();
  });
});
