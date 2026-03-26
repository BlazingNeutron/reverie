import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import request from "supertest";
import express, { type Express } from "express";

let mockSupabaseRPC: Mock<
  () => {
    data: boolean;
    error: unknown | object;
  }
> = vi.fn(() => ({
  data: true,
  error: null,
}));
let mockSignUp: Mock<
  () => {
    data: object;
    error: unknown | object;
  }
> = vi.fn(() => ({
  data: { session: { user: "userId", access_token: "token" } },
  error: null,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    rpc: mockSupabaseRPC,
    auth: {
      signUp: mockSignUp,
    },
  })),
}));

const defaultRequestBody = {
  email: "test@example.com",
  password: "Test1234!",
  confirm: "Test1234!",
  invite_code: "inviteCode1",
};

describe("User Signup API", () => {
  // let consoleSpy: Mock<(...data: unknown[]) => void>;
  let userRouter: express.Router;
  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("SUPABASE_URL", "http://supabaseBaseUrl");
    vi.stubEnv("SERVICE_ROLE_KEY", "specialKey");
    const userRouterDefault = await import("../routes");
    userRouter = userRouterDefault.default;
    mockSupabaseRPC = vi.fn(() => ({
      data: true,
      error: null,
    }));
    mockSignUp = vi.fn(() => ({
      data: { session: { user: "userId", access_token: "token" } },
      error: null,
    }));
  });

  it("POST /signup - SUPABASE_URL is not set", async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("SUPABASE_URL", "http://supabaseBaseUrl");

    const userRouterDefault = await import("../routes");
    userRouter = userRouterDefault.default;

    const response = await postSignUpRequest({
      ...defaultRequestBody,
    });
    expect(response.body).toEqual({
      success: false,
      error: {
        message: "SERVICE_ROLE_KEY in .env not set",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - SUPABASE_URL is not set", async () => {
    vi.resetModules();
    vi.unstubAllEnvs();

    const userRouterDefault = await import("../routes");
    userRouter = userRouterDefault.default;

    const response = await postSignUpRequest({
      ...defaultRequestBody,
    });
    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Missing SUPABASE_URL in .env",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - valid signup returns 201 and calls auth.signUp", async () => {
    const response = await postSignUpRequest({
      ...defaultRequestBody,
    });

    expect(response.body).toEqual({
      success: true,
      data: { session: { user: "userId", access_token: "token" } },
    });
    expect(response.status).toBe(201);
    expect(mockSignUp).toHaveBeenCalled();
  });

  it("POST /signup - invalid password returns 500", async () => {
    const response = await postSignUpRequest({
      ...defaultRequestBody,
      password: "TestPassword1!",
      confirm: "DoesNotMatchPassword",
    });

    expect(response.body).toEqual({
      success: false,
      error: {
        message:
          "Password does not meet requirements or does not match repeated password",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - invalid email returns 500", async () => {
    const response = await postSignUpRequest({
      ...defaultRequestBody,
      email: "badEmailAddress@a",
    });

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Email address is not a valid email address format",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - null invite Code returns 500", async () => {
    const response = await postSignUpRequest({
      ...defaultRequestBody,
      invite_code: null,
    });

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "An invite code is required to create an account",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - error calling supabase rpc returns 500", async () => {
    mockSupabaseRPC = vi.fn(() => ({
      data: false,
      error: {
        message: "Test Supbase Error",
      },
    }));
    const response = await postSignUpRequest({
      ...defaultRequestBody,
    });

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Test Supbase Error",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - invalid invite Code returns 500", async () => {
    mockSupabaseRPC = vi.fn(() => ({
      data: false,
      error: null,
    }));
    const response = await postSignUpRequest({
      ...defaultRequestBody,
    });

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "An unexpected error occurred during account creation",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("POST /signup - error calling supabase signUp returns 500", async () => {
    mockSignUp = vi.fn(() => ({
      data: {},
      error: {
        message: "Test Supabase signUp Error",
      },
    }));
    const response = await postSignUpRequest({
      ...defaultRequestBody,
    });

    expect(response.body).toEqual({
      success: false,
      error: {
        message: "Test Supabase signUp Error",
      },
    });
    expect(response.status).toBe(500);
    expect(mockSignUp).toHaveBeenCalled();
  });

  async function postSignUpRequest(
    requestObject: object,
  ): Promise<{ body: object; status: number }> {
    const app = express();
    app.use(express.json());
    app.use(userRouter);
    return await request(app).post("/signup").send(requestObject);
  }
});
