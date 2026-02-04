import { describe, it, expect, afterEach, beforeAll } from "vitest";

window = Object.create(window);
Object.defineProperty(window, "location", {
    value: {
        href: "http://kong:8000",
        protocol: "http:",
        host: "kong:8000"
    },
    writable: true
});


describe('supabase integration tests for collaboration', () => {
    let _supabase: any;
    let _insertYJsUpdates: any;
    let _createDocument: any;
    const documents: string[] = [];

    beforeAll(async () => {
        const { supabase } = await import("../client");
        const { insertYJsUpdates } = await import("../collaboration");
        const { createDocument } = await import("../documents");

        _supabase = supabase;
        _insertYJsUpdates = insertYJsUpdates;
        _createDocument = createDocument;
    })

    afterEach(() => {
        //clean up
        documents.forEach(async (docId) => {
            await _supabase.from('documents').delete().eq('doc_id', docId);
        })
    })

    it('Colllaboration, doc update is inserted', async () => {
        const results = await _supabase.from('profiles').select('user_id').limit(1).single();
        const user = results.data;
        const docId = await _createDocument("Integration Document", user?.user_id);

        documents.push(docId); // clean up later

        const result = await _insertYJsUpdates(docId, "base64Update");
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
