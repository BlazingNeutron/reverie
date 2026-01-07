import React, { createRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock yjs Doc
vi.mock('yjs', () => {
  return {
    Doc: class {
      getText(name: string) {
        return {
          insert: () => {},
          toString: () => 'mock',
        };
      }
    }
  };
});

// Mock quill and quill-cursors
vi.mock('quill', () => {
  function QuillMock(this: any, el: any, opts: any) {
    // emulate instance created by `new Quill(...)`
    return { el, opts };
  }
  (QuillMock as any).register = vi.fn();
  return { default: QuillMock };
});

vi.mock('quill-cursors', () => ({ default: {} }));

// Mock y-quill binding constructor
vi.mock('y-quill', () => ({ QuillBinding: vi.fn() }));

// Mock SupabaseProvider so Editor does not perform network work
vi.mock('../../lib/supabase/y-supabase-provider', () => ({
  SupabaseProvider: class {
    awareness = {};
    constructor() {
      // noop
    }
  },
}));

import ThemeProvider from '../theme-provider';

describe('ThemeProvider component', () => {
  it('Verify Light Theme is selected', async () => {
    const ref = createRef<any>();
    const { container } = render(<ThemeProvider ref={ref} />);
    const div = container.firstChild;
    expect(div.className).contains('light');
    
  });

  it('Verify Dark Theme is selected', async () => {
    window.matchMedia = vi.fn().mockImplementation(query => {
      return {
        matches: query === '(prefers-color-scheme: dark)',
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    });
    const ref = createRef<any>();
    const { container } = render(<ThemeProvider ref={ref} />);
    const div = container.firstChild;
    expect(div.className).contains('dark');
  });
});
