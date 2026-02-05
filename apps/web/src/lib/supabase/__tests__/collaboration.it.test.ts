import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { supabase } from "../client";
import { createDocument } from "../documents";
import { insertYJsUpdates } from "../collaboration";

describe('supabase integration tests for collaboration', () => {
    const documents: string[] = [];

    afterEach(() => {
        //clean up
        documents.forEach(async (docId) => {
            await supabase.from('documents').delete().eq('doc_id', docId);
        })
    })

    it('Colllaboration, doc update is inserted', async () => {
        const results = await supabase.from('profiles').select('user_id').limit(1).single();
        const user = results.data;
        const docId = await createDocument("Integration Document", user?.user_id);

        documents.push(docId); // clean up later

        const result = await insertYJsUpdates(docId, "base64Update");
        expect(result).toEqual({
            "count": null,
            "data": [
                {
                    "created_at": expect.any(String),
                    "doc_id": docId,
                    "id": expect.any(String),
                    "update": "base64Update",
                },
            ],
            "error": null,
            "status": 201,
            "statusText": "Created",
        })
    })
})
