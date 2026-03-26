import { beforeEach, describe, expect, it, vi } from "vitest";

const mockListen = vi.fn((port, cb) => cb && cb());
vi.mock("express", () => {
  const mockRouter = vi.fn(() => ({
    post: vi.fn(),
    get: vi.fn(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockExpress: any = vi.fn(() => ({
    use: vi.fn(),
    listen: mockListen,
  }));

  mockExpress.Router = mockRouter;
  mockExpress.json = vi.fn();
  mockExpress.static = vi.fn();

  return {
    default: mockExpress,
  };
});

describe("API Express", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("PORT set via env value", async () => {
    vi.stubEnv("REVERIE_API_PORT", "12345");
    await import("../app");

    expect(mockListen).toHaveBeenCalledWith("12345", expect.any(Function));
  });

  it("PORT not set - using default 3000", async () => {
    await import("../app");

    expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
