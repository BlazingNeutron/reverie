import {
  deleteYJsUpdatesBefore,
  insertYJsUpdates,
  selectYJsSnapshot,
  selectYJsUpdates,
  selectYJsUpdatesSince,
  upsertYJsSnapshot,
} from "../collaboration";
import { supabaseClientMock } from "../../../__mocks__/supabaseClientMock";
import { vi, describe, it, expect, afterEach } from "vitest";

describe("supabase collaboration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("Colllaboration, doc update is inserted", async () => {
    await insertYJsUpdates("docId1", "base64UpdateString");

    expect(supabaseClientMock.calls.query().inserts[0]).toEqual({
      doc_id: "docId1",
      update: "base64UpdateString",
    });
  });

  it("Select updates on specific document", async () => {
    await selectYJsUpdates("docId1");

    expect(supabaseClientMock.calls.query()).toEqual({
      filters: [
        {
          filter: "eq",
          column: "doc_id",
          value: "docId1",
        },
      ],
      order: {
        ascending: true,
        column: "created_at",
      },
      select: "update",
    });
  });

  it("upsertYJsSnapshot", async () => {
    const response = await upsertYJsSnapshot("docId1", "base64Snapshot");
    expect(response).toBeNull();
    expect(supabaseClientMock.calls.query()).toEqual({
      select: undefined,
      upserts: {
        doc_id: "docId1",
        snapshot: "base64Snapshot",
      },
    });
  });

  it("selectYJsSnapshot", async () => {
    const response = await selectYJsSnapshot("docId1");

    expect(response).not.toBeNull();
    expect(supabaseClientMock.calls.query()).toEqual({
      filters: [
        {
          filter: "eq",
          column: "doc_id",
          value: "docId1",
        },
      ],
      order: {
        ascending: false,
        column: "created_at",
      },
      limit: 1,
      select: "snapshot, created_at",
    });
  });

  it("selectYJsUpdatesSince", async () => {
    const response = await selectYJsUpdatesSince("docId1", "sinceDate");

    expect(response).not.toBeNull();
    expect(supabaseClientMock.calls.query()).toEqual({
      filters: [
        {
          filter: "eq",
          column: "doc_id",
          value: "docId1",
        },
        {
          filter: "gt",
          column: "created_at",
          value: "sinceDate",
        },
      ],
      order: {
        ascending: true,
        column: "created_at",
      },
      select: "update",
    });
  });

  it("deleteYJsUpdatesBefore", async () => {
    const response = await deleteYJsUpdatesBefore("docId1", "beforeDate");

    expect(response).not.toBeNull();
    expect(supabaseClientMock.calls.query()).toEqual({
      filters: [
        {
          column: "created_at",
          filter: "lt",
          value: "beforeDate",
        },
        {
          filter: "eq",
          column: "doc_id",
          value: "docId1",
        },
      ],
      deletes: "yjs_updates",
    });
  });
});
