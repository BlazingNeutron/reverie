import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";

describe("Supabase Publishable Key API", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("POST /keys returns 200 with publishableKey", async () => {
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "specialKey");
    const supabaseRouter = await import("../routes");
    const app = express();
    app.use(express.json());
    app.use(supabaseRouter.default);
    const response = await request(app).post("/keys");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      keys: {
        publishableKey: "specialKey",
      },
    });
  });

  it("POST /keys returns 500 when no env publishableKey", async () => {
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", undefined);
    const supabaseRouter = await import("../routes");
    const app = express();
    app.use(express.json());
    app.use(supabaseRouter.default);
    const response = await request(app).post("/keys");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: "SUPABASE_PUBLISHABLE_KEY in .env not set",
      },
    });
  });
});
