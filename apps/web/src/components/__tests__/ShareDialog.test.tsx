import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { ShareDialog } from "../ShareDialog";
import { act, cleanup, render } from "@testing-library/react";
import ReactDOMClient from "react-dom/client";

interface collaboratorType {
  user_id: string;
  display_name: string;
}

let mockFindCollaborators = vi.fn(
  async (): Promise<unknown | collaboratorType[]> => {
    return [{ user_id: "UserId1", display_name: "Test UserName" }];
  },
);
vi.mock("../../lib/supabase/sharing", () => ({
  findCollaborators: () => mockFindCollaborators(),
}));

describe("Share Dialog component", () => {
  let container: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    cleanup();
  });

  it("Share Dialog trigger button", async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });

    expect(container.querySelector("button")).toHaveTextContent("Share");
  });

  it("Share Dialog opens", async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });

    await act(async () => {
      const shareButton = container.querySelector("button");
      if (shareButton) {
        shareButton.click();
      }
    });

    expect(container.querySelector("#shareDialog")).toHaveTextContent(
      "Share this document",
    );
  });

  it("Unmounted ShareDialog does not load profile", async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((res) => (resolvePromise = res));
    mockFindCollaborators = vi.fn().mockReturnValue(pendingPromise);

    const { baseElement, unmount } = render(<ShareDialog />);
    unmount();

    act(() => {
      resolvePromise!([{ user_id: "UserId1", display_name: "Test UserName" }]);
    });

    expect(baseElement).toHaveTextContent("");
  });

  it("ShareDialog load profile into table row", async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });

    await act(async () => {
      const shareButton = container.querySelector("button");
      if (shareButton) {
        shareButton.click();
      }
    });

    expect(container.querySelector("#shareDialog")).toHaveTextContent(
      "Share this document",
    );

    expect(container).toHaveTextContent("TTest UserNameAdd");
  });

  it("ShareDialog load profile into table row", async () => {
    mockFindCollaborators = vi.fn(async () => null);
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });

    await act(async () => {
      const shareButton = container.querySelector("button");
      if (shareButton) {
        shareButton.click();
      }
    });

    expect(container.querySelector("#shareDialog")).toHaveTextContent(
      "Share this document",
    );

    expect(container).toHaveTextContent("document.DoneCancel");
  });

  it("ShareDialog error loading profiles", async () => {
    mockFindCollaborators = vi.fn(async () => {
      throw "Test Error";
    });
    await act(async () => {
      ReactDOMClient.createRoot(container).render(<ShareDialog />);
    });

    await act(async () => {
      const shareButton = container.querySelector("button");
      if (shareButton) {
        shareButton.click();
      }
    });

    expect(container.querySelector("#shareDialog")).toHaveTextContent(
      "Share this document",
    );

    expect(container).toHaveTextContent("document.DoneCancel");
  });
});
