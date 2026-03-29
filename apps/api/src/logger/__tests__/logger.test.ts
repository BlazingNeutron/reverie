import { beforeEach, describe, expect, it, vi } from "vitest";
import loggerRouter from "../routes";
import request from "supertest";
import express from "express";

describe("Logger API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("POST /logger return 200 and writes message to console", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    const app = express();
    app.use(express.json());
    app.use(loggerRouter);
    const response = await request(app)
      .post("/logger")
      .send({
        level: "test",
        message: "testMessage",
        metadata: { test: "extraData" },
      });

    expect(consoleSpy).toHaveBeenCalled();
    const callParams = consoleSpy.mock.calls[0];
    expect(callParams).not.toBeNull();
    if (!callParams) {
      expect.fail();
    }
    expect(callParams[0]).toContain('"message":"testMessage",');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
    });
  });

  it("POST /logger sets default level to info", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    const app = express();
    app.use(express.json());
    app.use(loggerRouter);
    await request(app)
      .post("/logger")
      .send({
        level: null,
        message: "testMessage",
        metadata: { test: "extraData" },
      });

    expect(consoleSpy).toHaveBeenCalled();
    const callParams = consoleSpy.mock.calls[0];
    expect(callParams).not.toBeNull();
    if (!callParams) {
      expect.fail();
    }
    expect(callParams[0]).toContain('"level":"info",');
  });

  it("POST /logger sets metedata to empty object", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    const app = express();
    app.use(express.json());
    app.use(loggerRouter);
    await request(app).post("/logger").send({
      level: "test",
      message: "testMessage",
      metadata: null,
    });

    expect(consoleSpy).toHaveBeenCalled();
    const callParams = consoleSpy.mock.calls[0];
    expect(callParams).not.toBeNull();
    if (!callParams) {
      expect.fail();
    }
    expect(callParams[0]).toContain('"metadata":{},');
  });
});
