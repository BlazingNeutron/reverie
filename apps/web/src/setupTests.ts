import '@testing-library/jest-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom'
import { supabaseClientMock } from './__mocks__/supabaseClientMock';

// TODO later with store context vi.mock('zustand') 
globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('./lib/supabase/client', () => ({ supabase: supabaseClientMock }));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})