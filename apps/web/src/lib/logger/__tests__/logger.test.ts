import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Logger } from "../logger";

describe("Logger Tests", () => {
  let logger: Logger;
  let mockArgs: any[];

  beforeEach(async () => {
    vi.unmock("../logger");
    const loggerDefault = await import("../logger");
    logger = loggerDefault.default;
    vi.stubGlobal(
      "fetch",
      vi.fn((...args) => {
        mockArgs = args;
        Promise.resolve({
          json: () => Promise.resolve({}),
        });
      }),
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it("Trace", async () => {
    const consoleSpy = vi.spyOn(console, "trace");

    logger.trace("Trace Message");

    expect(mockArgs).toEqual(expectParameters("trace", "Trace Message"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("Debug", async () => {
    const consoleSpy = vi.spyOn(console, "debug");

    logger.debug("Debug Message");

    expect(mockArgs).toEqual(expectParameters("debug", "Debug Message"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("Log", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    logger.log("Log Message");

    expect(mockArgs).toEqual(expectParameters("log", "Log Message"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("Warn", async () => {
    const consoleSpy = vi.spyOn(console, "warn");

    logger.warn("Warn Message");

    expect(mockArgs).toEqual(expectParameters("warn", "Warn Message"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("Error", async () => {
    const consoleSpy = vi.spyOn(console, "error");

    logger.error("Error Message");

    expect(mockArgs).toEqual(expectParameters("error", "Error Message"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("Loggin Parameters", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    logger.log("Log Params", 1, [2], {});

    expect(mockArgs).toEqual(expectParameters("log", "Log Params 1 [2] {}"));
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("API Server down fall back to console error", async () => {
    vi.resetAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw "Test Fetch Error";
      }),
    );
    const consoleSpy = vi.spyOn(console, "error");

    logger.log("Attempt call Logging API");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Logging failed:",
      "Test Fetch Error",
    );
  });

  function expectParameters(level: string, message: string) {
    return [
      "http://localhost:3000/api/v1/logger",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          '{"level":"' +
          level +
          '","message":"' +
          message +
          '","metadata":{"userAgent":"Mozilla/5.0 (linux) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/28.1.0","url":"http://localhost:3000/"}}',
      },
    ];
  }
});
