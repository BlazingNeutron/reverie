import { describe, it, expect, afterEach } from "vitest";
import { supabase } from "../client";
import { createDocument } from "../documents";
import {
  deleteYJsUpdatesBefore,
  insertYJsUpdates,
  selectYJsSnapshot,
  selectYJsUpdates,
  selectYJsUpdatesSince,
  upsertYJsSnapshot,
} from "../collaboration";

describe("supabase integration tests for collaboration", () => {
  const documents: string[] = [];

  afterEach(() => {
    //clean up
    documents.forEach(async (docId) => {
      await supabase.from("documents").delete().eq("doc_id", docId);
    });
  });

  async function createIntegrationDocument() {
    supabase.auth.signInWithPassword({
      email: "test@integration.test",
      password: "testPassword",
    });
    const profiles = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username", "test@integration.test")
      .limit(1)
      .single();
    const user = profiles.data;
    const docId = await createDocument("Integration Document", user?.user_id);

    documents.push(docId); // clean up later
    return docId;
  }

  it("Collaboration, doc update is inserted", async () => {
    const docId = await createIntegrationDocument();
    const result = await insertYJsUpdates(docId, "base64Update");
    expect(result).toEqual({
      count: null,
      data: [
        {
          created_at: expect.any(String),
          doc_id: docId,
          id: expect.any(String),
          update: "base64Update",
        },
      ],
      error: null,
      status: 201,
      statusText: "Created",
    });
  });

  it("Insert snapshot and update then select all udpates since", async () => {
    const docId = await createIntegrationDocument();

    const snapshot = await upsertYJsSnapshot(docId, "Snapshot");
    await insertYJsUpdates(docId, "AfterSnapshotUpdate");

    const results: any = await selectYJsUpdatesSince(
      docId,
      snapshot.created_at,
    );

    expect(results.data[0]).toEqual({
      update: "AfterSnapshotUpdate",
    });
  });

  it("Upsert 2 snapshots", async () => {
    const docId = await createIntegrationDocument();

    await upsertYJsSnapshot(docId, "Snapshot");
    await upsertYJsSnapshot(docId, "Snapshot2");
    const results = await selectYJsSnapshot(docId);

    expect(results.data[0]).toEqual({
      snapshot: "Snapshot2",
      created_at: expect.any(String),
    });
  });

  it("Insert 2 updates, selects in order", async () => {
    const docId = await createIntegrationDocument();

    await insertYJsUpdates(docId, "Update1");
    const snapshot = await upsertYJsSnapshot(docId, "Snapshot");
    await insertYJsUpdates(docId, "Update2");
    await insertYJsUpdates(docId, "Update3");
    const selectUpdates = await selectYJsUpdates(docId);

    expect(selectUpdates).toEqual({
      count: null,
      data: [
        {
          update: "Update1",
        },
        {
          update: "Update2",
        },
        {
          update: "Update3",
        },
      ],
      error: null,
      status: 200,
      statusText: "OK",
    });

    const selectUpdatesSince = await selectYJsUpdatesSince(
      docId,
      snapshot.created_at,
    );

    expect(selectUpdatesSince).toEqual({
      count: null,
      data: [
        {
          update: "Update2",
        },
        {
          update: "Update3",
        },
      ],
      error: null,
      status: 200,
      statusText: "OK",
    });
  });

  it("Insert 2 updates, selects in order", async () => {
    const docId = await createIntegrationDocument();

    await insertYJsUpdates(docId, "Update1");
    const snapshot = await upsertYJsSnapshot(docId, "Snapshot");
    await insertYJsUpdates(docId, "Update2");
    await insertYJsUpdates(docId, "Update3");
    await deleteYJsUpdatesBefore(docId, snapshot.created_at);
    const selectUpdates = await selectYJsUpdates(docId);

    expect(selectUpdates).toEqual({
      count: null,
      data: [
        {
          update: "Update2",
        },
        {
          update: "Update3",
        },
      ],
      error: null,
      status: 200,
      statusText: "OK",
    });
  });
});
