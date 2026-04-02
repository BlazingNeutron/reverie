import { supabaseClientMock } from "../../../__mocks__/supabaseClientMock";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

window = Object.create(window);
Object.defineProperty(window, "location", {
  value: {
    href: "http://test.com",
    protocol: "http:",
    host: "test.com",
  },
  writable: true, // possibility to override
});

let mockCreateClient = vi.fn().mockReturnValue(supabaseClientMock);
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: any[]) => mockCreateClient(args),
}));

vi.mock("../keys", () => ({
  getPublishableKey: () => "testPublishableKey",
}));

describe("supabase client", () => {
  const originalSiteUrl = process.env.SITE_URL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = originalSiteUrl;
  });

  it("supabase is returned", async () => {
    const supabase = await setImportClient();
    expect(supabase).toEqual(supabaseClientMock);
  });

  it("supabase called with baseUrl and key", async () => {
    delete process.env.SITE_URL;
    await setImportClient("averyspecialtestkey2");
    expect(mockCreateClient).toHaveBeenCalledOnce();
    expect(mockCreateClient).toHaveBeenCalledWith([
      "http://test.com",
      "averyspecialtestkey2",
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
        },
      },
    ]);
  });

  it("supabase key is not set", async () => {
    const consoleSpy = vi.spyOn(console, "warn");
    await setImportClient("");

    expect(consoleSpy).toHaveBeenCalled();
  });

  async function setImportClient(key?: string, session?: any) {
    supabaseClientMock.auth.getSession = vi
      .fn()
      .mockReturnValue({ data: { session: session } });
    vi.unmock("../keys");
    vi.doMock("../keys", () => ({
      getPublishableKey: () => key,
    }));
    vi.unmock("../client");
    const { supabase } = await import("../client");
    return supabase;
  }
});
