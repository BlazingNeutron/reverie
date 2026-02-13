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

const originalViteEnv = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

describe("supabase client", () => {
  beforeEach(() => {
    vi.resetModules();
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = originalViteEnv;
    import.meta.env.VITE_SUPABASE_BASE_URL = "http://test.com";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("supabase is returned", async () => {
    const supabase = await setImportClient("averyspecialtestkey");
    expect(supabase).toEqual(supabaseClientMock);
  });

  it("supabase called with baseUrl and key", async () => {
    await setImportClient("averyspecialtestkey2");
    expect(mockCreateClient).toHaveBeenCalledOnce();
    expect(mockCreateClient).toHaveBeenCalledWith([
      "http://test.com",
      "averyspecialtestkey2",
    ]);
  });

  it("supabase key is not set", async () => {
    const consoleSpy = vi.spyOn(console, "warn");
    await setImportClient("");

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("supabase session exists", async () => {
    await setImportClient("key", {
      user: { id: "test-user" },
      access_token: "test_access_token",
    });
    expect(mockCreateClient).toHaveBeenCalledTimes(2);
    expect(mockCreateClient).toHaveBeenCalledWith([
      "http://test.com",
      "test_access_token",
    ]);
  });

  async function setImportClient(key: string, session?: any) {
    supabaseClientMock.auth.getSession = vi
      .fn()
      .mockReturnValue({ data: { session: session } });
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = key;
    vi.unmock("../client");
    const { supabase } = await import("../client");
    return supabase;
  }
});
