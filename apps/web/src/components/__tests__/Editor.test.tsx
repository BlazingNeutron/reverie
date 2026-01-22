import { createRef, act } from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import ReactDOMClient from 'react-dom/client';
import Editor from '../Editor';

// Mock yjs Doc
vi.mock('yjs', () => {
  return {
    Doc: class {
      getText() {
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
    setDoc = () => {
      // noop
    }
  },
}));

describe('Editor component', () => {
  let container : any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('initializes Quill and QuillBinding', async () => {
    await act(async () => {
      const ref = createRef<any>();
      ReactDOMClient.createRoot(container).render(<Editor ref={ref} />);
    });

    await waitFor(async () => {
      const { QuillBinding } = await import('y-quill');
      expect((QuillBinding as any).mock.calls.length).toBeGreaterThan(0);
    });
  });

  it('switching currentDocId re-initializes editor', async () => {
    // set currentDocId to something else
    const useDocStore = (await import('../../lib/stores/documentStore')).useDocStore;
    await act(async () => {
      useDocStore.getState().setCurrentDocId('doc-id');
      const ref = createRef<any>();
      ReactDOMClient.createRoot(container).render(<Editor ref={ref} />);
    });
    const firstContainer = container.firstChild;
    const firstContainerHtml = firstContainer?.innerHTML;
    
    // set currentDocId to something else
    await act(async () => {
      useDocStore.getState().setCurrentDocId('another-doc-id');
    });
    
    const secondContainer = container.firstChild;
    const secondContainerHtml = secondContainer?.innerHTML;
    expect(firstContainerHtml).not.toBe(secondContainerHtml);
  });
});
