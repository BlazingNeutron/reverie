import { insertYJsUpdates, selectYJsUpdates } from "../collaboration";
import { supabaseClientMock } from '../../../__mocks__/supabaseClientMock';
import { vi, describe, it, expect, afterEach } from "vitest";

describe('supabase collaboration', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    })

    it('Colllaboration, doc update is inserted', async () => {
        await insertYJsUpdates("docId1", "base64UpdateString", "userId1")

        expect(supabaseClientMock.calls.query().inserts[0]).toEqual({
            "doc_id": "docId1",
            "update": "base64UpdateString",
            "user_id": "userId1",
        });
    })

    it('Select updates on specific document', async () => {
        await selectYJsUpdates("docId1", "userId1");

        //two equal and an order by
        expect(supabaseClientMock.calls.query()).toEqual({
            "filters": [
                {
                    "column": "doc_id",
                    "value": "docId1",
                },
                {
                    "column": "user_id",
                    "value": "userId1",
                },
            ],
            "order": {
                "ascending": true,
                "column": "created_at",
            },
            "select": "update",
        })
    })
})
