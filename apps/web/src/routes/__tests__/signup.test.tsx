import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReactDOMClient from "react-dom/client";
import { MemoryRouter } from "react-router";
import SignUp from "../signup";

let mockInviteCode = "INVITE_CODE";
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useSearchParams: vi.fn(() => [
      {
        get: (key: string) => (key === "__invite_code" ? mockInviteCode : null),
      },
      vi.fn(), // mock setter function
    ]),
  };
});

describe("SignUp component", () => {
  let container: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        });
      }),
    );
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    vi.unstubAllGlobals();
  });

  it("Renders a SignUp Form", async () => {
    await RenderSignUp();

    expect(container).toContainHTML("Create a new account");
  });

  it("Submit a successful sign up", async () => {
    await RenderSignUp();
    await completeSignUpForm("m@example.com", "Test1234!", "Test1234!");

    expect(container).toContainHTML("successfully signed up");
  });

  it("Submit an invalid email sign up", async () => {
    await RenderSignUp();
    await completeSignUpForm("a@e.c", "Test1234!", "Test1234!");

    expect(container).toContainHTML("Not a valid email address");
  });

  it("Submit an invalid password", async () => {
    await RenderSignUp();
    await completeSignUpForm("m@example.com", "1", "Test1234!");

    expect(container).toContainHTML("Password does not meet requirements");
  });

  it("Submit an mismatched confirmation password", async () => {
    await RenderSignUp();
    await completeSignUpForm("m@example.com", "Test1234!", "1");

    expect(container).toContainHTML("Password confirmation failed");
  });

  async function RenderSignUp(inviteCode: string = "INVITE_CODE") {
    mockInviteCode = inviteCode;
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>,
      );
    });
  }

  async function completeSignUpForm(
    emailData: string,
    passwordData: string,
    confirmationData: string,
  ) {
    const email = screen.getByPlaceholderText("m@example.com");
    const password = screen.getByLabelText("Password");
    const confirm = screen.getByLabelText("Confirm Password");

    await act(async () => {
      fireEvent.change(email, { target: { value: emailData } });
      fireEvent.change(password, { target: { value: passwordData } });
      fireEvent.change(confirm, { target: { value: confirmationData } });
    });

    await waitFor(() => {
      expect(container.querySelectorAll("button").length).toBe(1);
    });
    const submit = screen.getByRole("button", { name: /Sign up/i });
    await act(async () => {
      fireEvent.click(submit);
    });
  }
});
