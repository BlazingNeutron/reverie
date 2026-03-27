import "@testing-library/jest-dom";
import { vi } from "vitest";
import { supabaseClientMock } from "./__mocks__/supabaseClientMock";
import logger from "./__mocks__/loggerMock";
import { getPublishableKey } from "./__mocks__/keysMock";

// TODO later with store context vi.mock('zustand')
vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

vi.mock("./lib/supabase/client", () => ({ supabase: supabaseClientMock }));
vi.mock("./lib/logger/logger", () => ({ default: logger }));
vi.mock("./lib/supabase/keys", () => ({ default: getPublishableKey }));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
