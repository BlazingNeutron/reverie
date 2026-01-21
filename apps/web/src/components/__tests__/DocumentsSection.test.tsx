import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useDocStore } from '../../lib/stores/doc-store';
import { DocumentsSection } from '../DocumentsSection';

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

let mockFindUserDocs = async () => {
        return [
            { doc_id: 'doc1', title: 'Document 1' },
            { doc_id: 'doc2', title: 'Document 2' },
        ];
    };
// // Mock SupabaseProvider so Editor does not perform network work
vi.mock('../../lib/supabase/y-supabase-provider', () => ({
  SupabaseProvider: class {
    awareness = {};
    constructor() {
      // noop
    }
    findUserDocs = async () => mockFindUserDocs()
  },
}));

describe('Documents Section component', () => {
  beforeEach(() => {
    useDocStore.setState({ currentDocId: null });
    mockFindUserDocs = async () => {
        return [
            { doc_id: 'doc1', title: 'Document 1' },
            { doc_id: 'doc2', title: 'Document 2' },
        ];
    };
  });
  
  it('Document Section renders open', async () => {
    const { container } = render(<DocumentsSection open={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(2);
    });
  });

  it('First Document is selected', async () => {
    const { container } = render(<DocumentsSection open={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(2);
    });
    expect(useDocStore.getState().currentDocId).toBe("doc1");
  });

  it('Empty document list returned', async () => {
    mockFindUserDocs = async () => {
        return [];
    };
    const { container } = render(<DocumentsSection open={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(0);
    });
    expect(useDocStore.getState().currentDocId).toBe(null);
  });

  it('Exception finding document list', async () => {
    mockFindUserDocs = async () => {
        throw new Error("Test error");
    };
    const { container } = render(<DocumentsSection open={true} />);
    await waitFor(() => {
      expect(container.querySelectorAll('button').length).toBe(0);
    });
    expect(useDocStore.getState().currentDocId).toBe(null);
  });
});
