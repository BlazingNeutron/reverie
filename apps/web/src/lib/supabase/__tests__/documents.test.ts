import { createDocument, findUserDocs, selectDocument, updateDocumentSearch } from "../documents";
import { supabaseClientMock } from '../../../__mocks__/supabaseClientMock';
import { vi, describe, it, expect, afterEach } from "vitest";

describe('supabase documents', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    })

    it('Select by docId - valid it returns data, data is query params from mock supabase', async () => {
        const document = await selectDocument("docId1")

        expect(document).toEqual({
            "data": {
                "filters": [
                    {
                        "column": "doc_id",
                        "value": "docId1",
                    },
                ],
                "select": "doc_id, title, content, user_id",
            },
            "error": null,
        });
    });

    it('Update Document Search Index', async () => {
        await updateDocumentSearch("docId1", "TestTitle", "NewTestText", "userId1");

        expect(supabaseClientMock.calls.query().upserts).toEqual({
            "content": "NewTestText",
            "doc_id": "docId1",
            "title": "TestTitle",
            "user_id": "userId1",
        })
    })

    it('Find User\'s Documents', async () => {
        supabaseClientMock.results = [{ data: [{ doc_id: "docId1" }, { doc_id: "docId2" }] }];
        const documents = await findUserDocs("userId1");

        expect(documents).toEqual({
            "filters": [
                {
                    "column": "doc_id",
                    "value": [
                        "docId1",
                        "docId2",
                    ],
                },
            ],
            "order": {
                "ascending": false,
                "column": "title",
            },
            "select": "doc_id, title, user_id",
        });
    })

    it('Find User\'s Documents - no documents', async () => {
        supabaseClientMock.results = [{ data: null }];
        const documents = await findUserDocs("userId1");

        expect(documents).toEqual([])
    })

    it('Find User\'s Documents - no shared throws error', async () => {
        supabaseClientMock.results = [{ data: [{ doc_id: "docId1" }] }, {error:new Error("Test Error")}];
        const documents = await findUserDocs("userId1");

        expect(documents).toEqual([])
    })

    it('Create new Document', async () => {
        supabaseClientMock.results = [{ data: [{ doc_id: "newDocId1" } ]}];
        const newDocId = await createDocument("newTestTitle", "userId1");

        expect(newDocId).toBe("newDocId1");
    })

    it('Create new Document - fails', async () => {
        supabaseClientMock.results = [{ data: null }];
        const newDocId = await createDocument("newTestTitle", "userId1");

        expect(newDocId).toBeNull();
    })
})
