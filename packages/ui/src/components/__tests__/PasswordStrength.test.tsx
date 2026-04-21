import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ReactDOMClient from "react-dom/client";
import { PasswordStrength } from "../PasswordStrength";

describe("component test", () => {
  let container: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it("Renders a PasswordStrength component", async () => {
    await renderPasswordStrengthComponent();

    expect(container).toContainHTML("Shared Text");
  });

  async function renderPasswordStrengthComponent() {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<PasswordStrength />);
    });
  }
});
