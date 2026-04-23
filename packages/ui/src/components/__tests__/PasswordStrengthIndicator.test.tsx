import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ReactDOMClient from "react-dom/client";
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator";

describe("PasswordStrength", () => {
  let container: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  async function renderPasswordStrengthComponent(
    password: string | undefined = undefined,
  ) {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <PasswordStrengthIndicator password={password || ""} />,
      );
    });
  }

  it("Renders initial state when no password is provided", async () => {
    await renderPasswordStrengthComponent(undefined);

    // Expecting the default "Enter a password" state
    expect(container).toContainHTML("Enter a password (0/9+)");
  });

  it("Shows 'Weak' for password with only lowercase letters", async () => {
    await renderPasswordStrengthComponent("short");
    expect(container).toContainHTML("Weak (5/9+)");
  });

  it("Shows 'Strong' for password with mixed case and numbers", async () => {
    await renderPasswordStrengthComponent("Password123");
    expect(container).toContainHTML("Strong (11/9+)");
  });

  it("Shows 'Very Strong' for password meeting all criteria and length", async () => {
    const strongPassword = "P@ssword1234";
    await renderPasswordStrengthComponent(strongPassword);
    expect(container).toContainHTML("Very Strong (12/9+)");
  });
});
