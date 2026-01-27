import { broadcast, subscribe } from "../realtime";
import { supabaseClientMock } from '../../../__mocks__/supabaseClientMock';
import { vi, describe, it, expect, afterEach } from "vitest";

describe('supabase realtime', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        supabaseClientMock.calls.channels = [];
        supabaseClientMock.calls.on = [];
    })

    it('Realtime broadcast', async () => {
        await broadcast("docId1", "base64Update");

        expect(supabaseClientMock.calls.channels).toEqual(['yjs-docId1']);
        expect(supabaseClientMock.calls.sends).toEqual([{
            "event": "y-update",
            "payload": {
                "update": "base64Update",
            },
            "type": "broadcast",
        }]);
    });

    it('Realtime subscribe', async () => {
        const callback = vi.fn();
        await subscribe("docId1", callback);

        expect(supabaseClientMock.calls.channels).toEqual(['yjs-docId1']);
        expect(supabaseClientMock.calls.on[0][0]).toBe("broadcast");
        expect(supabaseClientMock.calls.on[0][1]).toEqual({"event": "y-update"});
    });

    it('Realtime subscribe - callback', async () => {
        const callback = vi.fn();
        await subscribe("docId1", callback);
        await broadcast("docId1", "base64Update");

        expect(callback).toHaveBeenCalled()
    });
})
