import { afterEach, describe, expect, it, vi } from "vitest";

describe("Retrieve Keys", () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  let getPublishableKey: () => Promise<string>;
  it("Fetch PublishableKey", async () => {
    vi.unmock("../keys");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve({ keys: { publishableKey: "testKey" } }),
        });
      }),
    );

    const keysDefault = await import("../keys");
    getPublishableKey = keysDefault.getPublishableKey;

    const key = await getPublishableKey();
    expect(key).toBe("testKey");
  });

  it("Fetch Key fails and logs error", async () => {
    vi.unmock("../keys");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw "Test Fetch Error";
      }),
    );
    const consoleSpy = vi.spyOn(console, "error");

    const keysDefault = await import("../keys");
    getPublishableKey = keysDefault.getPublishableKey;
    await getPublishableKey();

    expect(consoleSpy).toHaveBeenCalledWith([
      "[LoadKey] Error loading supabase publishableKey",
      "Test Fetch Error",
    ]);
  });
});
