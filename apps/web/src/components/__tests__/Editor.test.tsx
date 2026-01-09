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
    setDoc = (docId: string, ydoc: any) => {
      // noop
    }
  },
}));

import Editor from '../Editor';

describe('Editor component', () => {
  it('initializes Quill and QuillBinding', async () => {
    const ref = createRef<any>();

    const { container } = render(<Editor ref={ref} />);

    // wait for useEffect to run and QuillBinding to be called
    await waitFor(async () => {
      const { QuillBinding } = await import('y-quill');
      if ((QuillBinding as any).mock.calls.length === 0) throw new Error('binding not called yet');
    });

    // QuillBinding should have been called with a ytext, quill instance and awareness
    const { QuillBinding } = await import('y-quill');
    expect((QuillBinding as any).mock.calls.length).toBeGreaterThan(0);
  });

  it('switching currentDocId re-initializes editor', async () => {
    const ref = createRef<any>();
    // set currentDocId to something else
    const useDocStore = (await import('../../lib/state')).useDocStore;

    useDocStore.getState().setCurrentDocId('doc-id');
    const { container, rerender } = render(<Editor ref={ref} />);
    const firstContainer = container.firstChild;
    const firstContainerHtml = firstContainer?.innerHTML;
    
    // set currentDocId to something else
    useDocStore.getState().setCurrentDocId('another-doc-id');

    // Rerender with different doc id
    rerender(<Editor ref={ref} />);
    
    const secondContainer = container.firstChild;
    const secondContainerHtml = secondContainer?.innerHTML;
    expect(firstContainerHtml).not.toBe(secondContainerHtml);
  });
});
