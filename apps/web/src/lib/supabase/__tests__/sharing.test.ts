import { findCollaborators, shareDocument, unshareDocument } from "../sharing";
import { supabaseClientMock } from '../../../__mocks__/supabaseClientMock';
import { vi, describe, it, expect, afterEach } from "vitest";

describe('supabase sharing', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    })

    it('Sharing with one user inserts a row', async () => {
        await shareDocument("docId1", "userId2");

        expect(supabaseClientMock.calls.query()).toEqual({
            "inserts": {
                "doc_id": "new_doc_id",
                "user_id": "userId2",
            },
        });
    });

    it('Unsharing share document deletes the row', async () => {
        await unshareDocument("docId1", "userId2");

        expect(supabaseClientMock.calls.query()).toEqual({
            "deletes": "shared",
            "filters": [
                {
                    "column": "doc_id",
                    "value": "docId1",
                },
                {
                    "column": "user_id",
                    "value": "userId2",
                },
            ],
        });
    });

    it('Find Collaborators and their statuses', async () => {
        supabaseClientMock.results = [
            { data: [{ user_id: "userId2", display_name: "Test 2" }, { user_id: "userId3", display_name: "Test 3" }], error: null }, // profiles
            { data: [{ user_id: "userId1" }, { user_id: "userId2" }], error: null }  // share statuses
        ];
        const collaborators = await findCollaborators("docId1", "userId1");
        expect(collaborators).toEqual([
            {
                "display_name": "Test 2",
                "is_shared": true,
                "user_id": "userId2",
            },
            {
                "display_name": "Test 3",
                "is_shared": false,
                "user_id": "userId3",
            },
        ]);
    })

    it('Find Collaborators - no other profiles', async () => {
        supabaseClientMock.results = [
            { data: null, error: null }, // profiles
        ];
        const collaborators = await findCollaborators("docId1", "userId1");
        expect(collaborators).toEqual([]);
    })

    it('Find Collaborators - error finding profiles', async () => {
        supabaseClientMock.results = [
            { data: [{ user_id: "userId2" }], error: new Error("Test Error") }, // profiles
        ];
        const collaborators = await findCollaborators("docId1", "userId1");
        expect(collaborators).toEqual([]);
    })

    it('Find Collaborators - no shares', async () => {
        supabaseClientMock.results = [
            { data: [], error: null }, // profiles
            { data: null, error: null }  // share statuses
        ];
        const collaborators = await findCollaborators("docId1", "userId1");
        expect(collaborators).toEqual([]);
    });

    it('Find Collaborators - shares error', async () => {
        supabaseClientMock.results = [
            { data: [], error: null }, // profiles
            { data: null, error: new Error("Test Error") }  // share statuses
        ];
        const collaborators = await findCollaborators("docId1", "userId1");
        expect(collaborators).toEqual([]);
    });
})
