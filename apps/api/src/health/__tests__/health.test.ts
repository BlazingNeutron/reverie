import { describe, expect, it } from "vitest";
import healthRouter from "../health";
import request from "supertest";
import express from "express";

describe("Health Check API", () => {
  it("GET /health returns 200 with status ok", async () => {
    const app = express();
    app.use(express.json());
    app.use(healthRouter);
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      timestamp: expect.any(String),
    });
  });
});
